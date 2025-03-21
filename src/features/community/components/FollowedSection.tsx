import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import AlertBox from "@/components/ui/AlertBox";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

const USERS_PER_PAGE = 5;

interface FollowedUser {
  userId: string;
  name: string;
  profilePhotoUrl?: string | null;
  artistName?: string;
  id: string;
}

const FollowedSection: React.FC = () => {
  const { userDetails } = useAuth();
  const currentUserId = (userDetails as any)?.userId;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [followedUsers, setFollowedUsers] = useState<FollowedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  //const [followingCount, setFollowingCount] = useState<number>(0);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const totalPages = Math.ceil(followedUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const displayedUsers = followedUsers.slice(
    startIndex,
    startIndex + USERS_PER_PAGE
  );

  const navigate = useNavigate();

  // Fetch followed users using your custom logic
  const fetchFollowedUsers = useCallback(async () => {
    if (!currentUserId) return;

    setLoading(true);

    try {
      const userTransactionsRef = collection(
        db,
        "friends",
        currentUserId,
        "transactions"
      );

      const outgoingQuery = query(
        userTransactionsRef,
        where("userId", "==", currentUserId),
        orderBy("createdAt", "desc")
      );

      const incomingQuery = query(
        userTransactionsRef,
        where("connectionTo", "==", currentUserId),
        orderBy("createdAt", "desc")
      );

      const [outgoingSnapshot, incomingSnapshot] = await Promise.all([
        getDocs(outgoingQuery),
        getDocs(incomingQuery),
      ]);

      const allTransactions = [
        ...outgoingSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        ...incomingSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ];

      const userPairMap = new Map<
        string,
        { transaction: any; otherUserId: string }
      >();

      const getPairKey = (userId1: string, userId2: string) => {
        return userId1 < userId2
          ? `${userId1}-${userId2}`
          : `${userId2}-${userId1}`;
      };

      (allTransactions as any[]).forEach((transaction: any) => {
        const otherUserId =
          transaction.userId === currentUserId
            ? transaction.connectionTo
            : transaction.userId;
        const pairKey = getPairKey(currentUserId, otherUserId);

        if (!userPairMap.has(pairKey)) {
          userPairMap.set(pairKey, { transaction, otherUserId });
        } else {
          const existingEntry = userPairMap.get(pairKey)!;
          const existingTimestamp =
            existingEntry.transaction.createdAt?.seconds || 0;
          const newTimestamp = transaction.createdAt?.seconds || 0;
          if (newTimestamp > existingTimestamp) {
            userPairMap.set(pairKey, { transaction, otherUserId });
          }
        }
      });

      const followedUserIds: string[] = [];
      userPairMap.forEach(({ transaction, otherUserId }) => {
        if (transaction.transaction === "accept request") {
          followedUserIds.push(otherUserId);
        }
      });

      if (followedUserIds.length > 0) {
        const usersData: FollowedUser[] = [];
        const usersRef = collection(db, "user_registration");

        if (followedUserIds.length <= 10) {
          const usersQuery = query(
            usersRef,
            where("userId", "in", followedUserIds)
          );
          const usersSnapshot = await getDocs(usersQuery);
          usersSnapshot.docs.forEach((doc) => {
            const userData = doc.data();
            usersData.push({
              id: doc.id,
              userId: userData.userId,
              name: `${userData.first_name} ${userData.last_name}`,
              profilePhotoUrl: userData.profilePhotoUrl || null,
              artistName: userData.artist_band_name || "",
            });
          });
        } else {
          const batchSize = 10;
          const currentBatchIndex = Math.floor(
            ((currentPage - 1) * USERS_PER_PAGE) / batchSize
          );
          const neededBatches: number[] = [currentBatchIndex];
          if (currentBatchIndex > 0) neededBatches.push(currentBatchIndex - 1);
          if ((currentBatchIndex + 1) * batchSize < followedUserIds.length) {
            neededBatches.push(currentBatchIndex + 1);
          }

          const uniqueBatches = Array.from(new Set(neededBatches));

          for (const batchIndex of uniqueBatches) {
            const start = batchIndex * batchSize;
            const end = Math.min(start + batchSize, followedUserIds.length);
            const batch = followedUserIds.slice(start, end);
            const batchQuery = query(usersRef, where("userId", "in", batch));
            const batchSnapshot = await getDocs(batchQuery);
            batchSnapshot.docs.forEach((doc) => {
              const userData = doc.data();
              usersData.push({
                id: doc.id,
                userId: userData.userId,
                name: `${userData.first_name} ${userData.last_name}`,
                profilePhotoUrl: userData.profilePhotoUrl || null,
                artistName: userData.artist_band_name || "",
              });
            });
          }
        }

        setFollowedUsers(usersData);
      } else {
        setFollowedUsers([]);
      }
    } catch (error) {
      console.error("Error fetching followed users:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, currentPage]);

  useEffect(() => {
    fetchFollowedUsers();
  }, [fetchFollowedUsers]);

  // Convert the manual unfollow operation into a mutation
  const unfollowMutation = useMutation<string, Error, FollowedUser>({
    mutationFn: async (user: FollowedUser) => {
      if (!currentUserId) {
        throw new Error("User not logged in");
      }
      const now = new Date();
      const transactionDate = now.toISOString().split("T")[0];
      const transactionTime = now.toTimeString().split(" ")[0];
      const transactionId = uuidv4();

      const userTransactionsRef = collection(
        db,
        "friends",
        currentUserId,
        "transactions"
      );
      const otherUserTransactionsRef = collection(
        db,
        "friends",
        user.userId,
        "transactions"
      );

      await Promise.all([
        addDoc(userTransactionsRef, {
          transactionId,
          userId: currentUserId,
          connectionTo: user.userId,
          transaction: "unfollow",
          transactionDate,
          transactionTime,
          createdAt: serverTimestamp(),
        }),
        addDoc(otherUserTransactionsRef, {
          transactionId,
          userId: currentUserId,
          connectionTo: user.userId,
          transaction: "unfollow",
          transactionDate,
          transactionTime,
          createdAt: serverTimestamp(),
        }),
      ]);

      return user.userId;
    },
  });

  const handleUnfollow = async (user: FollowedUser) => {
    setActiveUserId(user.userId);
    try {
      await unfollowMutation.mutateAsync(user);
      // Optionally update the local state to remove the unfollowed user
      setFollowedUsers((prev) => prev.filter((u) => u.userId !== user.userId));
      setSuccessMessage(`You have unfollowed ${user.name}`);
      setShowSuccessDialog(true);
    } catch (err) {
      console.error("Error unfollowing user:", err);
    } finally {
      setActiveUserId(null);
    }
  };

  const handleChat = (userId: string) => {
    navigate(`/community/chat/${userId}`);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-[#C08B24] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="text-lg mt-1 ml-2 hidden">
        <div className="border-r border-gray-300 pr-2">
          {/* <div className="text-center font-bold">{followingCount}</div>  */}
          <div className="-mt-2">Following</div>
        </div>
        <div className="pl-2">
          <div className="-mt-2">Followers</div>
        </div>
      </div>

      <div className="mt-10">
        {displayedUsers.length > 0 ? (
          displayedUsers.map((user) => (
            <div
              key={user.userId}
              className="flex justify-between mt-3 border-b border-gray-300 pb-2"
            >
              <div className="flex">
                <div className="mr-2">
                  <img
                    className="rounded-full h-8 w-8 object-cover"
                    src={user.profilePhotoUrl || "/default-avatar.png"}
                    alt={user.name}
                  />
                </div>
                <div className="mt-1">{user.name}</div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => handleUnfollow(user)}
                  disabled={
                    (unfollowMutation as any).isLoading &&
                    activeUserId === user.userId
                  }
                  variant="outline"
                  className="text-red-500 border-red-500 hover:bg-red-50"
                >
                  {(unfollowMutation as any).isLoading &&
                  activeUserId === user.userId
                    ? "Unfollowing..."
                    : "Unfollow"}
                </Button>

                <Button
                  onClick={() => handleChat(user.userId)}
                  className="bg-accent hover:bg-accent/90 text-white"
                >
                  Chat
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            You are not following anyone yet.
          </div>
        )}

        {followedUsers.length > USERS_PER_PAGE && (
          <div className="flex justify-between items-center mt-6 px-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${
                currentPage === 1
                  ? "text-gray-300"
                  : "text-[#C08B24] hover:bg-[#C08B24]/10"
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full ${
                currentPage === totalPages
                  ? "text-gray-300"
                  : "text-[#C08B24] hover:bg-[#C08B24]/10"
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      <AlertBox
        showDialog={showSuccessDialog}
        setShowDialog={setShowSuccessDialog}
        onstepComplete={() => setSuccessMessage("")}
        title="Success"
        description={successMessage}
      />
    </div>
  );
};

export default FollowedSection;
