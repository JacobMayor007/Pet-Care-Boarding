"use client";

import React, { useEffect, useState } from "react";
import RentersNavigation from "../../RentersNavigation/page";
import "@ant-design/v5-patch-for-react-19";
import dayjs, { Dayjs } from "dayjs";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import "@ant-design/v5-patch-for-react-19";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isTomorrow from "dayjs/plugin/isTomorrow";
import { db } from "@/app/firebase/config";

dayjs.extend(isTomorrow);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrAfter);

interface boardID {
  params: Promise<{ id: string }>;
}

interface BoardDetails {
  boardId?: string;
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

export default function RoomDetails({ params }: boardID) {
  const { id } = React.use(params);
  const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);

  useEffect(() => {
    const getRoomDetails = async () => {
      try {
        const docRef = doc(db, "board", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Convert Timestamps to Dayjs
          const convertTimestamp = (ts: Timestamp | undefined) =>
            ts instanceof Timestamp ? dayjs(ts.toDate()) : null;

          const result: BoardDetails = {
            boardId: docSnap.id,
            Renter_CreatedAt: convertTimestamp(data.Renter_CreatedAt),
            Renter_Location: data.Renter_Location,
            Renter_PaymentMethod: data.Renter_PaymentMethod,
            Renter_RoomDescription: data.Renter_RoomDescription,
            Renter_RoomName: data.Renter_RoomName,
            Renter_RoomPrice: data.Renter_RoomPrice,
            Renter_TotalPrice: data.Renter_TotalPrice,
            Renter_TypeOfRoom: data.Renter_TypeOfRoom,
            Renter_UserEmail: data.Renter_UserEmail,
            Renter_UserFullName: data.Renter_UserFullName,
            Renter_RoomStatus: data.Renter_RoomStatus,
            Renter_UserID: data.Renter_UserID,
          };

          setBoardDetails(result);
        } else {
          setBoardDetails(null);
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setBoardDetails(null);
      }
    };

    getRoomDetails();
  }, [id]);

  return (
    <div>
      <nav className="relative z-20">
        <RentersNavigation />
      </nav>
      <div className="z-10 mx-52 h-screen">
        <div className="grid grid-cols-2 gap-4 mt-16">
          <div className="col-span-2 flex flex-row items-center justify-between">
            <h1 className="font-montserrat font-bold text-[#393939] text-2xl">
              Room Name: {boardDetails?.Renter_RoomName}
            </h1>
            <h1 className="font-montserrat font-bold text-[#006B95] text-xl">
              Price: {boardDetails?.Renter_RoomPrice}
            </h1>
          </div>
          <div className="h-96 flex justify-center items-center bg-white rounded-2xl drop-shadow-lg">
            <h1 className="font-montserrat text-xl font-bold">
              Image of {boardDetails?.Renter_RoomName}
            </h1>
          </div>
          <div className="grid grid-cols-2  gap-4">
            <div className="flex justify-center items-center bg-white drop-shadow-lg rounded-2xl">
              <h1 className="font-montserrat font-bold">
                {" "}
                {boardDetails?.Renter_RoomName}
              </h1>
            </div>
            <div className="flex justify-center items-center bg-white drop-shadow-lg rounded-2xl">
              <h1 className="font-montserrat font-bold">
                {" "}
                {boardDetails?.Renter_RoomName}
              </h1>
            </div>
            <div className="flex justify-center items-center bg-white drop-shadow-lg rounded-2xl">
              <h1 className="font-montserrat font-bold">
                {" "}
                {boardDetails?.Renter_RoomName}
              </h1>
            </div>
            <div className="flex justify-center items-center bg-white drop-shadow-lg rounded-2xl">
              <h1 className="font-montserrat font-bold">
                {boardDetails?.Renter_RoomName}
              </h1>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-5 mt-10 gap-10">
          <div className="col-span-3">
            <div className="w-full h-16 bg-white drop-shadow-lg rounded-lg mt-4 flex items-center">
              <div className="h-8 w-full flex flex-row items-center gap-4 justify-center">
                <h1 className="font-montserrat font-medium">
                  Type Of Payment:
                </h1>
                <p className="font-hind font-semibold">
                  {boardDetails?.Renter_PaymentMethod}
                </p>
              </div>
            </div>
          </div>
          <div className="col-span-2 my-auto">
            <h1 className="font-montserrat font-bold text-[#393939] text-xl">
              Type Of Room: {boardDetails?.Renter_TypeOfRoom}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
