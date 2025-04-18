"use client";

import React, { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { DocumentData, Timestamp } from "firebase/firestore";
import fetchUserData from "@/app/fetchData/fetchUserData";
import { Rate } from "antd";
import Link from "next/link";
import RentersNavigation from "../RentersNavigation/page";
import { fetchMyDataBoarders } from "./renterData";

interface myBoarders {
  id?: string;
  BC_AcceptedAt?: Dayjs | null;
  BC_BoarderBoardedAt?: Dayjs | null;
  BC_BoarderCheckInDate?: Dayjs | null;
  BC_BoarderCheckInTime?: Dayjs | null;
  BC_BoarderCheckOutDate?: Dayjs | null;
  BC_BoarderCheckOutTime?: Dayjs | null;
  BC_BoarderChoiceFeature?: [
    {
      label?: string;
      name?: string;
      value?: string;
    }
  ];
  BC_BoarderDays?: number;
  BC_BoarderDescriptor?: string;
  BC_BoarderDietaryRestrictions?: string;
  BC_BoarderEmail?: string;
  BC_BoarderFeedback?: string;
  BC_BoarderFullName?: string;
  BC_BoarderGuest?: number;
  BC_BoarderPaidAt?: Dayjs | null;
  BC_BoarderRate?: number;
  BC_BoarderStatus?: string;
  BC_BoarderTotalPrice?: number;
  BC_BoarderTypeRoom?: string;
  BC_BoarderUID?: string;
  BC_BoarderUpdated?: Dayjs | null;
  BC_RenterEmail?: string;
  BC_RenterFullName?: string;
  BC_RenterLocation?: string;
  BC_RenterPrice?: string;
  BC_RenterRoomID?: string;
  BC_RenterRoomName?: string;
  BC_RenterUID?: string;
  BC_TypeOfPayment?: string;
}

export default function AllTransactions() {
  const [boarders, setBoarders] = useState<myBoarders[]>([]);
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      const user = await fetchUserData();
      setUserData(user);
    };
    getUserData();
  }, []);

  useEffect(() => {
    const getMyBoarders = async () => {
      const userUID = userData[0]?.User_UID;

      console.log("Get Boarder User ID", userUID);

      try {
        const getBoarders = await fetchMyDataBoarders(userUID);
        const updatedBoarders = getBoarders.map((boarder: myBoarders) => ({
          ...boarder,
          BC_AcceptedAt:
            boarder?.BC_AcceptedAt instanceof Timestamp
              ? dayjs(boarder?.BC_AcceptedAt.toDate()) // Convert to Dayjs, not Date
              : null,
          BC_BoarderBoardedAt: boarder?.BC_BoarderBoardedAt
            ? dayjs(boarder.BC_BoarderBoardedAt.toDate())
            : null,
          BC_BoarderCheckInDate:
            boarder?.BC_BoarderCheckInDate instanceof Timestamp
              ? dayjs(boarder?.BC_BoarderCheckInDate.toDate()) // Convert to Dayjs, not Date
              : null,
          BC_BoarderCheckInTime:
            boarder?.BC_BoarderCheckInTime instanceof Timestamp
              ? dayjs(boarder?.BC_BoarderCheckInTime.toDate()) // Convert to Dayjs, not Date
              : null,
          BC_BoarderCheckOutDate:
            boarder?.BC_BoarderCheckOutDate instanceof Timestamp
              ? dayjs(boarder?.BC_BoarderCheckOutDate.toDate()) // Convert to Dayjs, not Date
              : null,
          BC_BoarderCheckOutTime:
            boarder?.BC_BoarderCheckOutTime instanceof Timestamp
              ? dayjs(boarder?.BC_BoarderCheckOutTime.toDate()) // Convert to Dayjs, not Date
              : null,
          BC_BoarderUpdated:
            boarder?.BC_BoarderUpdated instanceof Timestamp
              ? dayjs(boarder?.BC_BoarderUpdated.toDate()) // Convert to Dayjs, not Date
              : null,
          BC_BoarderPaidAt:
            boarder?.BC_BoarderPaidAt instanceof Timestamp
              ? dayjs(boarder?.BC_BoarderPaidAt.toDate()) // Convert to Dayjs, not Date
              : null,
        }));

        setBoarders(updatedBoarders);
      } catch (error) {
        console.error(error);
      }
    };

    getMyBoarders();
  }, [userData]);

  useEffect(() => {
    const isRated = boarders?.map((doc) => doc.BC_BoarderRate);

    if (isRated) {
      setRated(true);
    } else {
      setRated(false);
    }
  }, [boarders]);

  return (
    <div>
      <nav className="relative z-20">
        <RentersNavigation />
      </nav>
      <div className="z-10 mx-56 pt-10">
        <h1 className="font-montserrat font-bold text-4xl text-[#393939]">
          Transactions
        </h1>
        <div className=" w-full bg-white drop-shadow-lg rounded-xl mt-10 grid grid-cols-6 p-8 gap-4">
          <h1
            className={`font-montserrat text-xl ${
              rated ? `col-span-3` : `col-span-4`
            }`}
          >
            Room
          </h1>
          <h1 className="text-center font-montserrat text-2xl">Price</h1>
          <h1 className="text-center font-montserrat text-2xl">Status</h1>
          <h1
            className={
              !rated ? `hidden` : `block text-center font-montserrat text-2xl`
            }
          >
            Rate
          </h1>

          <div className="h-0.5 col-span-6 rounded-full bg-[#C3C3C3]" />
          {boarders.map((data) => {
            return (
              <div
                key={data?.id}
                className="col-span-6 grid grid-cols-6 items-center gap-4 relative"
              >
                <div className="bg-white drop-shadow-lg rounded-lg h-40 flex justify-center items-center">
                  Image of {data?.BC_BoarderFullName}
                </div>
                <div className="flex flex-col col-span-2 ml-8">
                  <h1 className="font-hind text-[#006B95]">
                    {" "}
                    Boarder: <span>{data?.BC_BoarderFullName}</span>
                  </h1>
                  <p className="font-montserrat font-bold text-[#393939]">
                    {data?.BC_BoarderTypeRoom}
                  </p>
                  <p className="mt-3 text-xl text-[#393939] font-hind">
                    {data?.BC_TypeOfPayment}
                  </p>
                </div>
                <h1 className="text-center font-hind text-xl">
                  Php {data?.BC_BoarderTotalPrice}
                </h1>
                <h1 className="text-center font-hind text-xl">
                  {data?.BC_BoarderStatus}
                </h1>
                {rated ? (
                  <Rate
                    value={data?.BC_BoarderRate}
                    disabled
                    className="text-center"
                  />
                ) : (
                  <p className="hidden" />
                )}
                <Link
                  href={`/Renter/Transactions/${data?.id}`}
                  className="absolute right-0 top-0 font-montserrat text-[#006B95] italic text-sm font-bold underline cursor-pointer"
                >
                  Show more Details
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
