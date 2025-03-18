import React from "react";
import Hendrix from "../../assets/profilepics/hendrix.jpg";
//import { useTheme } from "@/providers/ThemeProvider";

interface Profile {
  firstname: string;
  lastname: string;
}

// Sample profiles array – replace with your actual data.
const profiles: Profile[] = [
  { firstname: "Jimi", lastname: "Hendrix" },
  { firstname: "Stevie", lastname: "Wonder" },
  { firstname: "Prince", lastname: "Nelson" },
];

const Chatbox: React.FC = () => {
  //const { isDarkMode } = useTheme();
  //const [followedUsers, setFollowedUsers] = useState<Profile[]>([]);

  return (
    <div>
      <div className="font-semibold dark:text-white">Artist Active</div>
      <div className="mt-3 dark:text-gray-300">
        {profiles.map((profile, index) => (
          <div className="flex mt-3" key={index}>
            <div className="mr-2">
              <img
                className="rounded-full h-8 w-8 object-cover"
                src={Hendrix}
                alt={`${profile.firstname} ${profile.lastname}`}
              />
            </div>
            <p className="mt-1 text-sm">
              {profile.firstname} {profile.lastname}
            </p>
            <div className="ml-auto mt-1">
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="4.30078" cy="3.62305" r="3.5" fill="#5EC46F" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chatbox;
