"use client";
import fetchUserData from "../fetchData/fetchUserData";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BellOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { DocumentData } from "firebase/firestore";
import Signout from "../SignedOut/page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Loading from "../Loading/page";
import Link from "next/link";
import { MyNotification } from "../fetchData/renterData";
import { Rate } from "antd";

interface Notifications {
  id?: string;
  boardID?: string;
  createdAt?: string;
  message?: string;
  sender?: string;
  receiver?: string;
  status?: string;
  open?: boolean;
  title?: string;
  type?: string;
  hide?: boolean;
  rate?: number;
}

const RentersNavigation = () => {
  const divRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [logout, setLogout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [userUID, setUserUID] = useState("");
  useEffect(() => {
    const closeProfile = (e: MouseEvent) => {
      // Check if the click is outside the divRef element
      if (divRef.current && !divRef.current.contains(e.target as Node)) {
        setLogout(false);
      }
    };

    document.addEventListener("mousedown", closeProfile);

    return () => {
      document.removeEventListener("mousedown", closeProfile);
    };
  }, [logout]);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const user = await fetchUserData();
        setUserData(user);
        setUserUID(user[0]?.User_UID);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen">
        <nav>
          <RentersNavigation />
        </nav>
        <div>
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <nav className="h-20 flex flex-row justify-center items-center z-[2]">
      <div className="flex items-center justify-center gap-16 px-14 w-full">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => {
            {
              router.push("/");
            }
          }}
        >
          <Image src="/Logo.svg" height={54} width={54} alt="Logo" />
          <h1 className="text-2xl font-sigmar font-normal text-[#006B95]">
            Pet Care
          </h1>
        </div>
        <ul className="list-type-none flex items-center gap-3">
          {/* <Link
            href="/Renter"
            passHref
            legacyBehavior
            className="cursor-pointer"
          > */}
          <li className="w-28 h-14 flex items-center justify-center cursor-pointer">
            <Link
              href="/"
              className="font-montserrat text-base text-[#006B95] font-bold"
            >
              Dashboard
            </Link>
          </li>
          {/* </Link> */}
          {/* <Link href="//ListOfRooms" passHref legacyBehavior> */}
          <li className="w-fit h-14 flex items-center justify-center">
            <Link
              href="/ListOfRooms"
              className="font-montserrat text-base text-[#006B95] font-bold"
            >
              List Of Rooms
            </Link>
          </li>
          {/* </Link> */}
          <li className="w-fit h-14 flex items-center justify-center px-2">
            <Link
              href="/AddRoom"
              className="font-montserrat text-base text-[#006B95] font-bold"
            >
              Add New Room
            </Link>
          </li>
          <Link
            className="w-28 h-14 flex items-center justify-center cursor-pointer"
            href="//Transactions"
            passHref
            legacyBehavior
          >
            <a className="font-montserrat text-base text-[#006B95] font-bold">
              Transactions
            </a>
          </Link>

          {/* <Link href="//Messages" passHref legacyBehavior> */}
          <li className="w-28 h-14 flex items-center justify-center">
            <Link
              href="//Messages"
              className="font-montserrat text-base text-[#006B95] font-bold"
            >
              Messages
            </Link>
          </li>
          {/* </Link> */}
        </ul>
        <div className="flex flex-row gap-4 relative" ref={divRef}>
          <BellOutlined
            className="text-lg text-[#006B95] font-bold cursor-pointer"
            onClick={() => setShowNotif((prev) => !prev)}
          />
          <h1
            className="font-montserrat font-bold text-[#006B95] cursor-pointer"
            onClick={() => setLogout((prev) => !prev)}
          >
            {userData[0]?.User_Name} <FontAwesomeIcon icon={faChevronDown} />
          </h1>
          {logout ? (
            <div
              className={
                logout
                  ? `grid grid-rows-6 justify-center items-center bg-[#F3F3F3] drop-shadow-xl rounded-lg absolute top-10 -left-3 cursor-pointer h-fit w-56`
                  : `hidden`
              }
            >
              <Link
                href={`/Profile/Boarder/${userUID}`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                My Account
              </Link>
              <Link
                href={`/find-my-buddy`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Want to find your buddy?
              </Link>
              <Link
                href={`/Doctor`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Want to become part of our doctors?
              </Link>
              <Link
                href={`/Provider`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Want to become part of our product sellers?
              </Link>

              <Link
                href={`/Settings`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Settings
              </Link>

              <Signout />
            </div>
          ) : (
            <span className="hidden" />
          )}

          <div
            className={
              showNotif
                ? `flex absolute top-5 right-12 cursor-pointer transform-gpu ease-in-out duration-300`
                : `hidden`
            }
          >
            <UserNotification />
          </div>
        </div>
      </div>
    </nav>
  );
};

const UserNotification = () => {
  const [myNotification, setMyNotification] = useState<Notifications[]>([]);

  useEffect(() => {
    let unsubscribe: () => void;

    const getMyNotifications = async () => {
      try {
        const data = await fetchUserData();
        const userUID = data[0]?.User_UID;

        if (!userUID) {
          console.log("Logged In First");
          return;
        }

        unsubscribe = MyNotification(userUID, (newNotif) => {
          setMyNotification(newNotif);
        });
      } catch (error) {
        console.log(error);
      }
    };

    getMyNotifications();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <div className="max-w-[500px] w-[482px] h-fit max-h-[542px] bg-white drop-shadow-lg rounded-xl justify-self-center flex flex-col pb-1">
      <h1 className="font-hind text-lg mx-4 mt-4 mb-2">Notifications</h1>
      <div className="h-0.5 border-[#393939] w-full border-[1px] mb-2" />
      {myNotification.map((data) => {
        return (
          <div
            key={data?.id}
            className=" drop-shadow-lg grid grid-cols-12 p-1 items-center"
          >
            <div className="m-2 h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <div className="grid grid-cols-12 my-2 col-span-11">
              <a
                href={`/Renter/Transactions/${data?.boardID}`}
                className="col-span-11 grid grid-cols-12"
              >
                <div className="h-12 w-12 col-span-2 rounded-full bg-white drop-shadow-lg font-montserrat text-xs flex items-center justify-center text-center text-nowrap overflow-hidden">
                  Image of <br />
                  Pet
                </div>
                <div className="flex flex-col gap-1 font-montserrat text-wrap col-span-10 text-sm">
                  <h1 className="text-[#393939] font-medium">
                    {data?.message}{" "}
                    {data?.rate ? (
                      <Rate disabled defaultValue={data?.rate} />
                    ) : (
                      <p />
                    )}
                  </h1>
                  <p className="text-xs text-[#797979]">{data?.createdAt}</p>
                </div>
              </a>
              <div className="flex justify-center mt-0.5 ">
                <FontAwesomeIcon icon={faEyeSlash} />
              </div>
            </div>
            {data?.type === "Change Appointment" ? (
              <div className="flex flex-row justify-end gap-4 col-span-12 mr-10">
                <button
                  type="button"
                  className="bg-[#61C4EB] py-1 px-5 text-white rounded-lg"
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="bg-red-400 py-1 px-5 text-white rounded-lg"
                >
                  Reject
                </button>
              </div>
            ) : (
              <div className="hidden" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RentersNavigation;
