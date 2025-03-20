import React, { useState } from "react";
import AddBand from "@/features/music/component/AddBandComponent";
import AddSetList from "@/features/music/component/AddSetList";
import Logo from "@/assets/image/gybLive/GybLiveLogo.png";
import AddPerformance from "@/features/music/component/AddPerformance";
import BandList from "@/features/music/component/BandList";
import SetList from "@/features/music/component/SetList";
import PerformanceList from "@/features/music/component/PerformanceList";

interface Tab {
  name: string;
}

const GYBLive: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>("Performances");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const tabs: Tab[] = [
    { name: "Performances" },
    { name: "Setlists" },
    { name: "Bands" },
    { name: "Add Performance" },
    { name: "Add Setlist" },
    { name: "Add Band" },
  ];

  // Redirect edit: receives a page name and an optional item.
  const redirectEdit = (page: string, item: any = null): void => {
    setCurrentPage(page);
    if (item) {
      setSelectedItem(item);
    }
  };

  const clearSelectedItem = (): void => {
    setSelectedItem(null);
  };

  return (
    <div>
      <div className="flex w-full">
        <div className="w-full p-4">
          <div className="flex items-center justify-center gap-5 mb-2 border-b-2 pb-3">
            <img src={Logo} alt="GYB Live Logo" />
            {tabs.map((tab) => (
              <button
                key={tab.name}
                className={`text-base px-3 py-1 mb-0 cursor-pointer ${
                  currentPage === tab.name
                    ? "text-[#FFFFFF] rounded-full bg-accent"
                    : "text-[#324054]"
                }`}
                onClick={() => {
                  clearSelectedItem();
                  setCurrentPage(tab.name);
                }}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      {currentPage === "Add Band" && (
        <AddBand
          item={selectedItem}
          clearItem={clearSelectedItem}
          redirectEdit={redirectEdit}
        />
      )}
      {currentPage === "Add Setlist" && (
        <AddSetList
          item={selectedItem}
          clearItem={clearSelectedItem}
          redirectEdit={redirectEdit}
        />
      )}
      {currentPage === "Add Performance" && (
        <AddPerformance
          item={selectedItem}
          clearItem={clearSelectedItem}
          redirectEdit={redirectEdit}
        />
      )}
      {currentPage === "Bands" && <BandList redirectEdit={redirectEdit} />}
      {currentPage === "Setlists" && <SetList redirectEdit={redirectEdit} />}
      {currentPage === "Performances" && (
        <PerformanceList redirectEdit={redirectEdit} />
      )}
    </div>
  );
};

export default GYBLive;
