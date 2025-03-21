import React, { useState } from "react";
import SearchPeople from "./components/SearchPeople";
import FollowRequests from "./components/FollowRequests";
import FollowedSection from "./components/FollowedSection";

type FilterType = "followed" | "followRequest" | "searchPeople";


const Friends: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>("followed");

  const changeFilter = (newFilter: FilterType): void => {
    setFilter(newFilter);
  };

  return (
    <div className="w-full p-4 border-r-4 border-gray-100">
      <div>
        <div
          className="text-dark font-bold text-accent mb-4"
          style={{ fontSize: "30px" }}
        >
          FRIENDS
        </div>
        <div className="flex gap-2 items-center mb-5 border-b border-gray-300 pb-2">
          <div
            className={`cursor-pointer ${
              filter === "followed" ? "text-accent" : "text-gray-600"
            }`}
            onClick={() => changeFilter("followed")}
          >
            Followed
          </div>
          <div>|</div>
          <div
            className={`cursor-pointer ${
              filter === "followRequest" ? "text-accent" : "text-gray-600"
            }`}
            onClick={() => changeFilter("followRequest")}
          >
            Follow Request
          </div>
          <div>|</div>
          <div
            className={`cursor-pointer ${
              filter === "searchPeople" ? "text-accent" : "text-gray-600"
            }`}
            onClick={() => changeFilter("searchPeople")}
          >
            Search People
          </div>
        </div>

        {/* Followed Section */}
        {filter === "followed" && (
          <div>
            <FollowedSection />
          </div>
        )}

        {/* Follow Request Section */}
        {filter === "followRequest" && (
          <div>
            <FollowRequests />
          </div>
        )}

        {/* Search People Section */}
        {filter === "searchPeople" && (
          <div>
            <SearchPeople />
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
