import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import Hendrix from "../../../assets/profilepics/hendrix.jpg";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
  serverTimestamp,
  limit,
  orderBy,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../../firebase";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import AlertBox from "@/components/ui/AlertBox";

import { useMutation } from "@tanstack/react-query";

const USERS_PER_PAGE = 5;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const USER_DETAILS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for user details

// Define types for a follow request and the requests state
interface FollowRequest {
  transactionId: string;
  userId: string;
  connectionTo: string;
  transaction: string;
  transactionDate: string;
  transactionTime: string;
  createdAt?: any;
  userName: string;
  profilePhotoUrl?: string | null;
  artist_band_name?: string;
}

interface Requests {
  received: FollowRequest[];
  sent: FollowRequest[];
}

const FollowRequests: React.FC = () => {
  const { userDetails } = useAuth();
  // Cast userDetails as any if it doesn’t include a userId property
  //const currentUserId = (userDetails as any)?.userId;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [requests, setRequests] = useState<Requests>({
    received: [],
    sent: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [lastQueryTime, setLastQueryTime] = useState<{ [key: string]: number }>(
    {}
  );
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Cache for user details
  const userDetailsCache = useRef<{
    [key: string]: { data: any; timestamp: number };
  }>({});

  const currentRequests = requests[activeTab] || [];
  const totalPages = Math.ceil(currentRequests.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const displayedRequests = currentRequests.slice(
    startIndex,
    startIndex + USERS_PER_PAGE
  );

  // Determine if cache is still valid
  const isCacheValid = (key: string, duration = CACHE_DURATION): boolean => {
    const time = lastQueryTime[key];
    if (!time) return false;
    return Date.now() - time < duration;
  };

  // Get user details with caching (batching requests when needed)
  const getUserDetails = useCallback(
    async (userIds: string[]): Promise<{ [key: string]: any }> => {
      if (!userIds || userIds.length === 0) return {};

      // Filter out IDs that are already cached and valid
      const userIdsToFetch = userIds.filter((userId) => {
        const cachedEntry = userDetailsCache.current[userId];
        return (
          !cachedEntry ||
          !isCacheValid(`user_${userId}`, USER_DETAILS_CACHE_DURATION)
        );
      });

      if (userIdsToFetch.length === 0) {
        const result: { [key: string]: any } = {};
        userIds.forEach((userId) => {
          result[userId] = userDetailsCache.current[userId]?.data;
        });
        return result;
      }

      const userDetailsMap: { [key: string]: any } = {};
      const batchSize = 10;
      for (let i = 0; i < userIdsToFetch.length; i += batchSize) {
        const batch = userIdsToFetch.slice(i, i + batchSize);
        if (batch.length === 0) continue;
        const usersRef = collection(db, "user_registration");
        const usersQuery = query(usersRef, where("userId", "in", batch));
        try {
          const usersSnapshot = await getDocs(usersQuery);
          usersSnapshot.docs.forEach((doc) => {
            const userData = doc.data();
            userDetailsMap[userData.userId] = {
              id: doc.id,
              userId: userData.userId,
              name: `${userData.first_name} ${userData.last_name}`,
              profilePhotoUrl: userData.profilePhotoUrl || null,
              artist_band_name: userData.artist_band_name || "",
            };
            // Update cache
            userDetailsCache.current[userData.userId] = {
              data: userDetailsMap[userData.userId],
              timestamp: Date.now(),
            };
          });
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      }
      // Combine with existing cached data for users not fetched
      userIds.forEach((userId) => {
        if (!userDetailsMap[userId] && userDetailsCache.current[userId]) {
          userDetailsMap[userId] = userDetailsCache.current[userId].data;
        }
      });
      // Update query timestamps
      const newQueryTimes = { ...lastQueryTime };
      userIds.forEach((userId) => {
        newQueryTimes[`user_${userId}`] = Date.now();
      });
      setLastQueryTime(newQueryTimes);
      return userDetailsMap;
    },
    [lastQueryTime]
  );

  // Process transactions to determine unique follow requests
  const processTransactions = useCallback(
    (transactions: any[], currentUserId: string) => {
      if (!transactions.length)
        return { receivedRequests: [], sentRequests: [] };

      const userPairMap = new Map<string, any>();
      const sortedTransactions = [...transactions].sort((a, b) => {
        const dateA = new Date(`${a.transactionDate} ${a.transactionTime}`);
        const dateB = new Date(`${b.transactionDate} ${b.transactionTime}`);
        return dateB.getTime() - dateA.getTime();
      });
      sortedTransactions.forEach((transaction) => {
        const userId = transaction.userId;
        const connectionTo = transaction.connectionTo;
        const pairKey = [userId, connectionTo].sort().join("-");
        if (!userPairMap.has(pairKey)) {
          userPairMap.set(pairKey, transaction);
        }
      });
      const filteredTransactions = Array.from(userPairMap.values()).filter(
        (t) => t.transaction === "follow request"
      );
      const receivedRequests = filteredTransactions.filter(
        (t) => t.connectionTo === currentUserId
      );
      const sentRequests = filteredTransactions.filter(
        (t) => t.userId === currentUserId
      );
      return { receivedRequests, sentRequests };
    },
    []
  );

  // Fetch follow requests data and enrich with user details
  const fetchAllRequestData = useCallback(async () => {
    if (!(userDetails as any)?.userId) return;
    if (isCacheValid("requests_received") && isCacheValid("requests_sent"))
      return;
    setLoading(true);
    try {
      const transactionsRef = collection(
        db,
        "friends",
        (userDetails as any)?.userId,
        "transactions"
      );
      const transactionsQuery = query(
        transactionsRef,
        orderBy("transactionDate", "desc"),
        orderBy("transactionTime", "desc"),
        limit(100)
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const allTransactions = transactionsSnapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      }));
      const { receivedRequests, sentRequests } = processTransactions(
        allTransactions,
        (userDetails as any)?.userId
      );
      const userIds = new Set<string>();
      receivedRequests.forEach((req) => userIds.add(req.userId));
      sentRequests.forEach((req) => userIds.add(req.connectionTo));
      const userDetailsMap = await getUserDetails(Array.from(userIds));
      const enrichedReceivedRequests = receivedRequests.map((transaction) => {
        const userDetail = userDetailsMap[transaction.userId];
        return {
          ...transaction,
          userName: userDetail ? userDetail.name : "Unknown User",
          profilePhotoUrl: userDetail ? userDetail.profilePhotoUrl : null,
          artist_band_name: userDetail ? userDetail.artist_band_name : "",
          userId: transaction.userId,
        } as FollowRequest;
      });
      const enrichedSentRequests = sentRequests.map((transaction) => {
        const userDetail = userDetailsMap[transaction.connectionTo];
        return {
          ...transaction,
          userName: userDetail ? userDetail.name : "Unknown User",
          profilePhotoUrl: userDetail ? userDetail.profilePhotoUrl : null,
          artist_band_name: userDetail ? userDetail.artist_band_name : "",
          userId: transaction.connectionTo,
        } as FollowRequest;
      });
      setRequests({
        received: enrichedReceivedRequests,
        sent: enrichedSentRequests,
      });
      setLastQueryTime((prev) => ({
        ...prev,
        requests_received: Date.now(),
        requests_sent: Date.now(),
      }));
    } catch (error) {
      console.error("Error fetching follow requests:", error);
    } finally {
      setLoading(false);
    }
  }, [userDetails, getUserDetails, processTransactions]);

  useEffect(() => {
    fetchAllRequestData();
  }, [fetchAllRequestData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Mutation hook for accepting a follow request
  const acceptMutation = useMutation<void, Error, FollowRequest>({
    mutationFn: async (request: FollowRequest) => {
      if (!(userDetails as any)?.userId) throw new Error("User not logged in");
      const now = new Date();
      const transactionDate = now.toISOString().split("T")[0];
      const transactionTime = now.toTimeString().split(" ")[0];
      const transactionId = uuidv4();
      const batch = writeBatch(db);
      const userDocRef = doc(
        collection(db, "friends", (userDetails as any)?.userId, "transactions")
      );
      batch.set(userDocRef, {
        transactionId,
        userId: (userDetails as any).userId,
        connectionTo: request.userId,
        transaction: "accept request",
        transactionDate,
        transactionTime,
        createdAt: serverTimestamp(),
      });
      const otherUserDocRef = doc(
        collection(db, "friends", request.userId, "transactions")
      );
      batch.set(otherUserDocRef, {
        transactionId,
        userId: (userDetails as any).userId,
        connectionTo: request.userId,
        transaction: "accept request",
        transactionDate,
        transactionTime,
        createdAt: serverTimestamp(),
      });
      await batch.commit();
    },
    onSuccess: (_, request) => {
      setRequests((prev) => ({
        ...prev,
        received: prev.received.filter((r) => r.userId !== request.userId),
      }));
      setSuccessMessage(`You are now following ${request.userName}`);
      setShowSuccessDialog(true);
      setLastQueryTime((prev) => ({
        ...prev,
        requests_received: 0,
        requests_sent: 0,
      }));
    },
    onError: (error) => {
      console.error("Error accepting follow request:", error);
    },
  });

  // Mutation hook for denying a follow request
  const denyMutation = useMutation<void, Error, FollowRequest>({
    mutationFn: async (request: FollowRequest) => {
      if (!(userDetails as any)?.userId) throw new Error("User not logged in");
      const now = new Date();
      const transactionDate = now.toISOString().split("T")[0];
      const transactionTime = now.toTimeString().split(" ")[0];
      const transactionId = uuidv4();
      const batch = writeBatch(db);
      const userDocRef = doc(
        collection(db, "friends", (userDetails as any).userId, "transactions")
      );
      batch.set(userDocRef, {
        transactionId,
        userId: (userDetails as any).userId,
        connectionTo: request.userId,
        transaction: "deny request",
        transactionDate,
        transactionTime,
        createdAt: serverTimestamp(),
      });
      const otherUserDocRef = doc(
        collection(db, "friends", request.userId, "transactions")
      );
      batch.set(otherUserDocRef, {
        transactionId,
        userId: (userDetails as any).userId,
        connectionTo: request.userId,
        transaction: "deny request",
        transactionDate,
        transactionTime,
        createdAt: serverTimestamp(),
      });
      await batch.commit();
    },
    onSuccess: (_, request) => {
      setRequests((prev) => ({
        ...prev,
        received: prev.received.filter((r) => r.userId !== request.userId),
      }));
      setSuccessMessage(
        `You have declined the follow request from ${request.userName}`
      );
      setShowSuccessDialog(true);
      setLastQueryTime((prev) => ({
        ...prev,
        requests_received: 0,
        requests_sent: 0,
      }));
    },
    onError: (error) => {
      console.error("Error denying follow request:", error);
    },
  });

  // Mutation hook for canceling a sent follow request
  const cancelMutation = useMutation<void, Error, FollowRequest>({
    mutationFn: async (request: FollowRequest) => {
      if (!(userDetails as any)?.userId) throw new Error("User not logged in");
      const now = new Date();
      const transactionDate = now.toISOString().split("T")[0];
      const transactionTime = now.toTimeString().split(" ")[0];
      const transactionId = uuidv4();
      const batch = writeBatch(db);
      const targetId = request.connectionTo || request.userId;
      const userDocRef = doc(
        collection(db, "friends", (userDetails as any).userId, "transactions")
      );
      batch.set(userDocRef, {
        transactionId,
        userId: (userDetails as any).userId,
        connectionTo: targetId,
        transaction: "unfollow",
        transactionDate,
        transactionTime,
        createdAt: serverTimestamp(),
      });
      const otherUserDocRef = doc(
        collection(db, "friends", targetId, "transactions")
      );
      batch.set(otherUserDocRef, {
        transactionId,
        userId: (userDetails as any).userId,
        connectionTo: targetId,
        transaction: "unfollow",
        transactionDate,
        transactionTime,
        createdAt: serverTimestamp(),
      });
      await batch.commit();
    },
    onSuccess: (_, request) => {
      const targetId = request.connectionTo || request.userId;
      setRequests((prev) => ({
        ...prev,
        sent: prev.sent.filter(
          (r) => (r.connectionTo || r.userId) !== targetId
        ),
      }));
      setSuccessMessage(
        `Follow request to ${request.userName} has been canceled`
      );
      setShowSuccessDialog(true);
      setLastQueryTime((prev) => ({
        ...prev,
        requests_received: 0,
        requests_sent: 0,
      }));
    },
    onError: (error) => {
      console.error("Error canceling follow request:", error);
    },
  });

  // Handlers calling the mutation hooks
  const handleAccept = async (request: FollowRequest) => {
    setActiveUserId(request.userId);
    try {
      await acceptMutation.mutateAsync(request);
    } catch (error) {
      console.error(error);
    } finally {
      setActiveUserId(null);
    }
  };

  const handleDeny = async (request: FollowRequest) => {
    setActiveUserId(request.userId);
    try {
      await denyMutation.mutateAsync(request);
    } catch (error) {
      console.error(error);
    } finally {
      setActiveUserId(null);
    }
  };

  const handleCancel = async (request: FollowRequest) => {
    setActiveUserId(request.userId);
    try {
      await cancelMutation.mutateAsync(request);
    } catch (error) {
      console.error(error);
    } finally {
      setActiveUserId(null);
    }
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

  return (
    <div>
      {/* Tab Selector */}
      <div className="flex text-lg mt-1 ml-2">
        <div
          className={`border-r border-gray-300 pr-2 cursor-pointer ${
            activeTab === "received" ? "text-accent" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("received")}
        >
          <div className="text-center font-bold">
            {requests.received?.length || 0}
          </div>
          <div className="-mt-2">Received Requests</div>
        </div>
        <div
          className={`pl-2 cursor-pointer ${
            activeTab === "sent" ? "text-accent" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("sent")}
        >
          <div className="text-center font-bold">
            {requests.sent?.length || 0}
          </div>
          <div className="-mt-2">Sent Requests</div>
        </div>
      </div>

      {/* Request List */}
      <div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayedRequests.length > 0 ? (
          displayedRequests.map((request) => (
            <div
              key={request.transactionId}
              className="flex justify-between mt-3 border-b border-gray-300 pb-2"
            >
              <div className="flex">
                <div className="mr-2">
                  <img
                    className="rounded-full h-8 w-8 object-cover"
                    src={request.profilePhotoUrl || Hendrix}
                    alt={request.userName}
                  />
                </div>
                <div className="mt-1">{request.userName}</div>
              </div>
              <div className="flex space-x-2">
                {activeTab === "received" ? (
                  <>
                    <Button
                      onClick={() => handleAccept(request)}
                      disabled={
                        (acceptMutation as any).isLoading &&
                        activeUserId === request.userId
                      }
                      className="flex gap-2.5 justify-center items-center text-base font-bold leading-none hover:bg-accent/90 text-center text-white whitespace-nowrap bg-accent rounded-[30px] px-4 py-2"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      <span className="self-stretch my-auto">
                        {(acceptMutation as any).isLoading &&
                        activeUserId === request.userId
                          ? "Accepting..."
                          : "Accept"}
                      </span>
                    </Button>
                    <Button
                      onClick={() => handleDeny(request)}
                      disabled={
                        (denyMutation as any).isLoading &&
                        activeUserId === request.userId
                      }
                      className="flex gap-2.5 justify-center items-center text-base font-bold leading-none text-center hover:bg-gray-100 text-red-500 whitespace-nowrap bg-white border border-red-500 rounded-[30px] px-4 py-2"
                    >
                      <X className="w-4 h-4 mr-1" />
                      <span className="self-stretch my-auto">
                        {(denyMutation as any).isLoading &&
                        activeUserId === request.userId
                          ? "Denying..."
                          : "Deny"}
                      </span>
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleCancel(request)}
                    disabled={
                      (cancelMutation as any).isLoading &&
                      activeUserId === request.userId
                    }
                    className="flex gap-2.5 justify-center items-center text-base bg-inherit hover:bg-gray-100 font-bold leading-none text-center text-red-500 whitespace-nowrap border border-red-500 rounded-[30px] px-4 py-2"
                  >
                    <span className="self-stretch my-auto">
                      {(cancelMutation as any).isLoading &&
                      activeUserId === request.userId
                        ? "Canceling..."
                        : "Cancel Request"}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No {activeTab} requests found.
          </div>
        )}

        {/* Pagination Controls */}
        {currentRequests.length > USERS_PER_PAGE && (
          <div className="flex justify-between items-center mt-6 px-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${
                currentPage === 1
                  ? "text-gray-300"
                  : "text-accent hover:bg-accent/10"
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
                  : "text-accent hover:bg-accent/10"
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Success Dialog */}
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

export default FollowRequests;
