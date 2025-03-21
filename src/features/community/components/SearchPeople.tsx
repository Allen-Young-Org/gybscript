import { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  X,
  Check,
} from "lucide-react";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { Button } from "@/components/ui/button";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  writeBatch,
  serverTimestamp,
  limit,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/providers/AuthProvider";
import AlertBox from "@/components/ui/AlertBox";
import { v4 as uuidv4 } from "uuid";

const USERS_PER_PAGE = 10;

interface User {
  id: string;
  name: string;
  profilePhoto?: string | null;
  artistName?: string;
  email: string;
  userId: string;
  status: string;
}

interface FollowingStatusEntry {
  status: string;
  transactionId?: string;
  docId?: string;
  direction?: "incoming" | "outgoing";
}

interface FollowingStatus {
  [key: string]: FollowingStatusEntry;
}

const SearchPeople: React.FC = () => {
  const { userDetails } = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [followingStatus, setFollowingStatus] = useState<FollowingStatus>({});
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  //const [lastVisible, setLastVisible] = useState<any>(null);

  const displayedUsers = allUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const totalPages = Math.ceil(allUsers.length / USERS_PER_PAGE);

  const handleSearch = async () => {
    if (!searchTerm.trim() || !(userDetails as any)?.userId) return;

    setLoading(true);
    try {
      const usersRef = collection(db, "user_registration");
      const searchLower = searchTerm.toLowerCase();

      // Search by searchableName (for name-based searches)
      const nameQuery = query(
        usersRef,
        where("searchableName", ">=", searchLower),
        where("searchableName", "<=", searchLower + "\uf8ff"),
        orderBy("searchableName"),
        where("status", "in", ["active", "pending"]),
        limit(30)
      );

      // Search by email
      const emailQuery = query(
        usersRef,
        where("email", ">=", searchLower),
        where("email", "<=", searchLower + "\uf8ff"),
        orderBy("email"),
        where("status", "in", ["active", "pending"]),
        limit(30)
      );

      // Execute both queries in parallel for better performance
      const [nameSnapshot, emailSnapshot] = await Promise.all([
        getDocs(nameQuery),
        getDocs(emailQuery),
      ]);

      // De-duplicate and process results
      const uniqueUsers = new Map<string, User>();

      // Helper function to process snapshot results
      const processSnapshot = (snapshot: any) => {
        snapshot.docs.forEach((doc: any) => {
          const data = doc.data();
          // Skip current user
          if (data.userId === (userDetails as any)?.userId) return;

          uniqueUsers.set(data.userId, {
            id: doc.id,
            name: `${data.first_name} ${data.last_name}`,
            profilePhoto: data.profilePhotoUrl || null,
            artistName: data.artist_band_name || "",
            email: data.email,
            userId: data.userId,
            status: data.status,
          });
        });
      };

      processSnapshot(nameSnapshot);
      processSnapshot(emailSnapshot);

      const foundUsers = Array.from(uniqueUsers.values());
      setAllUsers(foundUsers);
      setCurrentPage(1);

      // Check friendship status for displayed users
      if (foundUsers.length > 0) {
        await checkFriendshipStatus(foundUsers.slice(0, USERS_PER_PAGE));
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkFriendshipStatus = async (users: User[]) => {
    if (!(userDetails as any)?.userId || !users.length) return;

    try {
      const userIds = users.map((user) => user.userId);
      const statusMap: FollowingStatus = { ...followingStatus };

      // Limit to checking 10 users at a time
      const userIdsToCheck = userIds.slice(0, 10);

      const outgoingQuery = query(
        collection(db, "friends", (userDetails as any).userId, "transactions"),
        where("connectionTo", "in", userIdsToCheck)
      );

      const incomingQuery = query(
        collection(db, "friends", (userDetails as any).userId, "transactions"),
        where("userId", "in", userIdsToCheck)
      );

      const [outgoingSnapshot, incomingSnapshot] = await Promise.all([
        getDocs(outgoingQuery),
        getDocs(incomingQuery),
      ]);

      const transactions = [
        ...outgoingSnapshot.docs.map((doc: any) => ({
          docId: doc.id,
          ...doc.data(),
        })),
        ...incomingSnapshot.docs.map((doc: any) => ({
          docId: doc.id,
          ...doc.data(),
        })),
      ];

      userIdsToCheck.forEach((userId) => {
        const userTransactions = transactions.filter(
          (t) =>
            (t.connectionTo === userId &&
              t.userId === (userDetails as any).userId) ||
            (t.userId === userId &&
              t.connectionTo === (userDetails as any).userId)
        );

        if (!userTransactions.length) {
          statusMap[userId] = { status: "none" };
        } else {
          const sortedTransactions = userTransactions.sort((a, b) => {
            const dateA = new Date(`${a.transactionDate} ${a.transactionTime}`);
            const dateB = new Date(`${b.transactionDate} ${b.transactionTime}`);
            return dateB.getTime() - dateA.getTime();
          });

          const latestTransaction = sortedTransactions[0];
          statusMap[userId] = {
            status: latestTransaction.transaction,
            transactionId: latestTransaction.transactionId,
            docId: latestTransaction.docId,
            direction:
              latestTransaction.userId === (userDetails as any).userId
                ? "outgoing"
                : "incoming",
          };
        }
      });

      setFollowingStatus(statusMap);
    } catch (error) {
      console.error("Error checking friendship status:", error);
    }
  };

  useEffect(() => {
    if (displayedUsers.length > 0 && (userDetails as any)?.userId) {
      checkFriendshipStatus(displayedUsers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    displayedUsers.map((user) => user.userId).join(","),
    (userDetails as any)?.userId,
  ]);

  const handleFollowRequest = async (targetUser: User) => {
    if (!(userDetails as any)?.userId) return;

    setActionLoading(true);
    setActiveUserId(targetUser.userId);

    try {
      const now = new Date();
      const transactionDate = now.toISOString().split("T")[0];
      const transactionTime = now.toTimeString().split(" ")[0];
      const transactionId = uuidv4();

      const batch = writeBatch(db);

      const userTransactionRef = doc(
        collection(db, "friends", (userDetails as any).userId, "transactions")
      );
      batch.set(userTransactionRef, {
        transactionId,
        userId: (userDetails as any).userId,
        connectionTo: targetUser.userId,
        transaction: "follow request",
        transactionDate,
        transactionTime,
        createdAt: serverTimestamp(),
      });

      const targetTransactionRef = doc(
        collection(db, "friends", targetUser.userId, "transactions")
      );
      batch.set(targetTransactionRef, {
        transactionId,
        userId: (userDetails as any).userId,
        connectionTo: targetUser.userId,
        transaction: "follow request",
        transactionDate,
        transactionTime,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      setFollowingStatus((prev) => ({
        ...prev,
        [targetUser.userId]: {
          status: "follow request",
          transactionId,
          direction: "outgoing",
        },
      }));

      setSuccessMessage(`Follow request sent to ${targetUser.name}`);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error sending follow request:", error);
    } finally {
      setActionLoading(false);
      setActiveUserId(null);
    }
  };

  const handleCancelRequest = async (targetUser: User) => {
    if (!(userDetails as any)?.userId) return;

    const userStatus = followingStatus[targetUser.userId];
    if (!userStatus || !userStatus.transactionId) {
      console.error("No transaction ID found for this request");
      return;
    }

    setActionLoading(true);
    setActiveUserId(targetUser.userId);

    try {
      const batch = writeBatch(db);
      const now = new Date();
      const transactionDate = now.toISOString().split("T")[0];
      const transactionTime = now.toTimeString().split(" ")[0];
      const transactionId = uuidv4();

      const userTransactionRef = doc(
        collection(db, "friends", (userDetails as any).userId, "transactions")
      );
      batch.set(userTransactionRef, {
        transactionId,
        userId: (userDetails as any).userId,
        connectionTo: targetUser.userId,
        transaction: "unfollow",
        transactionDate,
        transactionTime,
        createdAt: serverTimestamp(),
      });

      const targetTransactionRef = doc(
        collection(db, "friends", targetUser.userId, "transactions")
      );
      batch.set(targetTransactionRef, {
        transactionId,
        userId: (userDetails as any).userId,
        connectionTo: targetUser.userId,
        transaction: "unfollow",
        transactionDate,
        transactionTime,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      setFollowingStatus((prev) => ({
        ...prev,
        [targetUser.userId]: { status: "none" },
      }));

      setSuccessMessage(
        `Follow request to ${targetUser.name} has been canceled`
      );
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error canceling follow request:", error);
    } finally {
      setActionLoading(false);
      setActiveUserId(null);
    }
  };

  const handleAcceptRequest = async (targetUser: User) => {
    if (!(userDetails as any)?.userId) return;

    const userStatus = followingStatus[targetUser.userId];
    if (!userStatus || !userStatus.transactionId) {
      console.error("No transaction ID found for this request");
      return;
    }

    setActionLoading(true);
    setActiveUserId(targetUser.userId);

    try {
      const batch = writeBatch(db);
      const now = new Date();
      const transactionDate = now.toISOString().split("T")[0];
      const transactionTime = now.toTimeString().split(" ")[0];
      const transactionId = uuidv4();

      const userTransactionRef = doc(
        collection(db, "friends", (userDetails as any).userId, "transactions")
      );
      batch.set(userTransactionRef, {
        transactionId,
        userId: (userDetails as any).userId,
        connectionTo: targetUser.userId,
        transaction: "accept request",
        transactionDate,
        transactionTime,
        createdAt: serverTimestamp(),
      });

      const targetTransactionRef = doc(
        collection(db, "friends", targetUser.userId, "transactions")
      );
      batch.set(targetTransactionRef, {
        transactionId,
        userId: (userDetails as any).userId,
        connectionTo: targetUser.userId,
        transaction: "accept request",
        transactionDate,
        transactionTime,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      setFollowingStatus((prev) => ({
        ...prev,
        [targetUser.userId]: {
          status: "accept request",
          transactionId,
          direction: "incoming",
        },
      }));

      setSuccessMessage(`You are now following ${targetUser.name}`);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error accepting follow request:", error);
    } finally {
      setActionLoading(false);
      setActiveUserId(null);
    }
  };

  const handleDenyRequest = async (targetUser: User) => {
    if (!(userDetails as any)?.userId) return;

    const userStatus = followingStatus[targetUser.userId];
    if (!userStatus || !userStatus.transactionId) {
      console.error("No transaction ID found for this request");
      return;
    }

    setActionLoading(true);
    setActiveUserId(targetUser.userId);

    try {
      const batch = writeBatch(db);
      const now = new Date();
      const transactionDate = now.toISOString().split("T")[0];
      const transactionTime = now.toTimeString().split(" ")[0];
      const transactionId = uuidv4();

      const userTransactionRef = doc(
        collection(db, "friends", (userDetails as any).userId, "transactions")
      );
      batch.set(userTransactionRef, {
        transactionId,
        userId: (userDetails as any).userId,
        connectionTo: targetUser.userId,
        transaction: "deny request",
        transactionDate,
        transactionTime,
        createdAt: serverTimestamp(),
      });

      const targetTransactionRef = doc(
        collection(db, "friends", targetUser.userId, "transactions")
      );
      batch.set(targetTransactionRef, {
        transactionId,
        userId: (userDetails as any).userId,
        connectionTo: targetUser.userId,
        transaction: "deny request",
        transactionDate,
        transactionTime,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      setFollowingStatus((prev) => ({
        ...prev,
        [targetUser.userId]: {
          status: "deny request",
          transactionId,
          direction: "incoming",
        },
      }));

      setSuccessMessage(
        `You have declined the follow request from ${targetUser.name}`
      );
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error denying follow request:", error);
    } finally {
      setActionLoading(false);
      setActiveUserId(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const renderActionButtons = (user: User) => {
    const userStatus = followingStatus[user.userId] || { status: "none" };
    const isLoading = actionLoading && activeUserId === user.userId;

    switch (userStatus.status) {
      case "follow request":
        if (userStatus.direction === "outgoing") {
          return (
            <Button
              onClick={() => handleCancelRequest(user)}
              disabled={isLoading}
              variant="outline"
              className="text-red-500 border-red-500 hover:bg-red-50"
            >
              {isLoading ? "Canceling..." : "Cancel Request"}
            </Button>
          );
        } else {
          return (
            <div className="flex space-x-2">
              <Button
                onClick={() => handleAcceptRequest(user)}
                disabled={isLoading}
                className="bg-[#C08B24] hover:bg-[#C08B24]/90 text-white px-4"
              >
                <Check className="w-4 h-4 mr-1" />
                {isLoading ? "Accepting..." : "Accept"}
              </Button>
              <Button
                onClick={() => handleDenyRequest(user)}
                disabled={isLoading}
                variant="outline"
                className="text-red-500 border-red-500 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                {isLoading ? "Denying..." : "Deny"}
              </Button>
            </div>
          );
        }
      case "accept request":
        return (
          <Button disabled className="bg-gray-300 text-gray-700">
            Following
          </Button>
        );
      case "deny request":
      case "none":
      default:
        return (
          <Button
            onClick={() => handleFollowRequest(user)}
            disabled={isLoading}
            className="bg-accent hover:bg-accent/90 text-white px-4"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            {isLoading ? "Sending..." : "Follow"}
          </Button>
        );
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex justify-end">
        <div className="flex w-1/3 items-center gap-2 mb-6">
          <div className="relative">
            <FloatingLabelInput
              label="Search users"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="pr-12"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading || !searchTerm.trim()}
            className="bg-accent hover:bg-accent/90 text-white px-6"
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#C08B24] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayedUsers.length > 0 ? (
          displayedUsers.map((user) => (
            <div
              key={user.id}
              className="flex justify-between items-center p-4 border-b border-gray-200"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={user.profilePhoto || "/default-avatar.png"}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  {user.artistName && (
                    <p className="text-sm text-gray-500">{user.artistName}</p>
                  )}
                </div>
              </div>
              {renderActionButtons(user)}
            </div>
          ))
        ) : searchTerm ? (
          <div className="text-center py-8 text-gray-500">
            No users found matching your search.
          </div>
        ) : null}

        {allUsers.length > USERS_PER_PAGE && (
          <div className="flex justify-center items-center space-x-4 py-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-2 rounded-full disabled:text-gray-300 text-[#C08B24]"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full disabled:text-gray-300 text-[#C08B24]"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      <AlertBox
        showDialog={showSuccessDialog}
        setShowDialog={setShowSuccessDialog}
        onstepComplete={() => {}}
        title="Success"
        description={successMessage}
      />
    </div>
  );
};

export default SearchPeople;
