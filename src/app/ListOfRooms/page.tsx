"use client";
import RentersNavigation from "../RentersNavigation/page";
import React, { useEffect, useState } from "react";
import fetchUserData from "@/app/fetchData/fetchUserData";
import {
  collection,
  DocumentData,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import dayjs, { Dayjs } from "dayjs";
import { db } from "@/app/firebase/config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

interface myBoard {
  id?: string;
  Renter_CreatedAt?: Dayjs | null;
  Renter_Location?: string;
  Renter_PaymentMethod?: string;
  Renter_RoomDescription?: string;
  Renter_RoomName?: string;
  Renter_RoomPrice?: string;
  Renter_RoomFeatures?: [
    {
      id?: string;
      name?: string;
      price?: string;
    }
  ];
  Renter_TotalPrice?: number;
  Renter_TypeOfRoom?: string;
  Renter_UserEmail?: string;
  Renter_UserFullName?: string;
  Renter_RoomStatus?: string;
  Renter_UserID?: string;
}

export default function ListOfRooms() {
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [selected, setSelected] = useState("reserved");
  const [dropDownStatus, setDropDownStatus] = useState(false);
  const status = [
    { name: "reserved" },
    { name: "occupied" },
    { name: "vacant" },
  ];
  const [roomEmph, setRoomEmph] = useState<myBoard[]>([]);

  useEffect(() => {
    const getUserData = async () => {
      const user = await fetchUserData();
      console.log(user);

      setUserData(user);
    };
    getUserData();
  }, []);

  useEffect(() => {
    const getMyListOfRooms = async () => {
      try {
        const renterID = userData[0]?.User_UID;

        const q = query(
          collection(db, "board"),
          where("Renter_UserID", "==", renterID),
          where("Renter_RoomStatus", "==", selected)
        );
        const unsubscribe = onSnapshot(q, (querSnapshot) => {
          const board: myBoard[] = querSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              Renter_CreatedAt: data?.Renter_CreatedAt
                ? dayjs(data?.Renter_CreatedAt.toDate())
                : null,
            };
          });
          setRoomEmph(board);
        });
        return () => unsubscribe();
      } catch (err) {
        console.error(err);
      }
    };
    getMyListOfRooms();
  }, [userData, selected]);

  return (
    <div>
      <nav className="z-20 relative">
        <RentersNavigation />
      </nav>
      <div className="z-10 mx-52 h-screen">
        <div className="flex justify-between items-center pt-10 px-4">
          <h1 className="font-montserrat text-3xl font-bold text-[#393939]">
            List Of Rooms
          </h1>
          <div className="relative">
            <button
              className="font-montserrat text-lg capitalize h-9 w-fit rounded-full bg-white drop-shadow-lg flex flex-row items-center gap-2 px-4"
              onClick={() => setDropDownStatus((prev) => !prev)}
            >
              {selected} <FontAwesomeIcon icon={faChevronDown} />
            </button>
            <div
              className={
                dropDownStatus
                  ? `absolute  mt-2 flex flex-col gap-0.5`
                  : `hidden`
              }
            >
              {status.map((data, index) => {
                return (
                  <button
                    className="h-9 w-[170px] font-montserrat rounded-md bg-white drop-shadow-md"
                    key={index}
                    onClick={() => {
                      setSelected(data?.name);
                      setDropDownStatus((prev) => !prev);
                    }}
                  >
                    {data?.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {roomEmph.length === 0 ? (
          <p className="mt-16 text-center font-bold font-montserrat text-[#393939] text-2xl">
            You have no rooms yet please,{" "}
            <span className="text-[#006B95] italic capitalize underline">
              <Link href={`/AddRoom`}>add your rooms first</Link>
            </span>
          </p>
        ) : (
          <div className="mt-10 h-fit grid-cols-4 gap-5">
            {roomEmph.slice(0, 4).map((data) => {
              return (
                <div
                  key={data?.id}
                  className="bg-white drop-shadow-lg h-72 w-64 p-4 rounded-lg flex flex-col gap-4"
                >
                  <div className="h-1/2 flex justify-center items-center font-montserrat font-bold">
                    Image of {data?.Renter_RoomName}
                  </div>
                  <div>
                    <p className="font-montserrat text-[#565656]">
                      {data?.Renter_TypeOfRoom}
                    </p>
                    <h1 className="font-hind font-bold">
                      {data?.Renter_RoomName}
                    </h1>
                  </div>
                  <p className="font-hind font-semibold">
                    Php {data?.Renter_RoomPrice}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
