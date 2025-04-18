"use client";

import React, { useEffect, useState } from "react";
import RentersNavigation from "../../RentersNavigation/page";
// import {

// } from "../../renterData";
import "@ant-design/v5-patch-for-react-19";
import dayjs, { Dayjs } from "dayjs";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";
import { Modal } from "antd";
import "@ant-design/v5-patch-for-react-19";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isTomorrow from "dayjs/plugin/isTomorrow";
import {
  acceptedBooked,
  paidBooking,
  roomDetails,
  checkedInRoom,
} from "../renterData";

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
  BC_BoarderUID?: string;
  BC_BoarderFullName?: string;
  BC_BoarderEmail?: string;
  BC_BoarderBoardedAt?: Dayjs | null;
  BC_BoarderCheckInTime?: Dayjs | null;
  BC_BoarderCheckOutTime?: Dayjs | null;
  BC_BoarderCheckInDate?: Dayjs | null;
  BC_BoarderCheckOutDate?: Dayjs | null;
  BC_BoarderChoiceFeature?: [
    {
      label?: string;
      name?: string;
      value?: number;
    }
  ];
  BC_BoarderDays?: number;
  BC_BoarderDietaryRestrictions?: string;
  BC_BoarderGuest?: string;
  BC_BoarderStatus?: string;
  BC_BoarderUpdated?: Dayjs | null;
  BC_BoarderTypeRoom?: string;
  BC_RenterRoomID?: string;
  BC_RenterFullName?: string;
  BC_RenterUID?: string;
  BC_RenterRoomName?: string;
  BC_RenterPrice?: string;
  BC_RenterLocation?: string;
  BC_RenterEmail?: string;
  BC_TypeOfPayment?: string;
  BC_BoarderTotalPrice?: number;
}

interface Value {
  features?: number[];
}

export default function RoomDetails({ params }: boardID) {
  const { id } = React.use(params);
  const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
  const [featureValue, setFeatureValue] = useState<Value | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [acceptModal, setAcceptModal] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [showModalPaid, setShowModalPaid] = useState(false);
  const [checkedInModal, setCheckedInModal] = useState(false);

  useEffect(() => {
    const getRoomDetails = async () => {
      try {
        const details = await roomDetails(id);
        setBoardDetails({
          ...details,
          BC_BoarderBoardedAt:
            details?.BC_BoarderBoardedAt instanceof Timestamp
              ? dayjs((details?.BC_BoarderBoardedAt).toDate())
              : null,
          BC_BoarderCheckInDate:
            details?.BC_BoarderCheckInDate instanceof Timestamp
              ? dayjs((details?.BC_BoarderCheckInDate).toDate())
              : null,
          BC_BoarderCheckOutDate:
            details?.BC_BoarderCheckOutDate instanceof Timestamp
              ? dayjs((details?.BC_BoarderCheckOutDate).toDate())
              : null,
          BC_BoarderCheckInTime:
            details?.BC_BoarderCheckInTime instanceof Timestamp
              ? dayjs((details?.BC_BoarderCheckInTime).toDate())
              : null,
          BC_BoarderCheckOutTime:
            details?.BC_BoarderCheckOutTime instanceof Timestamp
              ? dayjs((details?.BC_BoarderCheckOutTime).toDate())
              : null,
          BC_BoarderUpdated:
            details?.BC_BoarderUpdated instanceof Timestamp
              ? dayjs((details?.BC_BoarderUpdated).toDate())
              : null,
        });
      } catch (error) {
        console.error(error);
        setBoardDetails(null);
      }
    };
    getRoomDetails();
  }, [id]);

  useEffect(() => {
    if (boardDetails?.BC_BoarderChoiceFeature) {
      const featureValues = boardDetails.BC_BoarderChoiceFeature.map(
        (data) => data?.value
      ).filter((value): value is number => value !== undefined); // ✅ Filter out undefined values

      setFeatureValue({ features: featureValues });
    }
  }, [boardDetails]);

  useEffect(() => {
    const totalValue: number =
      featureValue?.features?.reduce((a, b) => a + b) || 0;
    const total =
      Number(totalValue || 0) + Number(boardDetails?.BC_RenterPrice);

    setTotalPrice(total);
  }, [featureValue, boardDetails?.BC_RenterPrice]);

  useEffect(() => {
    if (!boardDetails?.BC_BoarderCheckOutDate) return;

    // Convert the stored UTC+8 date to the local timezone
    const checkOutDate = dayjs(boardDetails?.BC_BoarderCheckOutDate);
    const now = dayjs();
    const tomorrow = dayjs(checkOutDate).add(1, "day");
    console.log("Tomorrow: ", tomorrow);

    // Get today's date in the same time zone

    // ✅ Check if the checkout date is today or in the future
    if (
      now.format("MMMM DD, YYYY") ===
      boardDetails?.BC_BoarderCheckOutDate.format("MMMM DD, YYYY")
    ) {
      setCheckedIn(true);
    } else if (now.isAfter(checkOutDate.toDate(), "day")) {
      setCheckedIn(true);
    } else if (now.isBefore(checkOutDate.toDate(), "day")) {
      setCheckedIn(false);
    }
  }, [boardDetails]);

  console.log(checkedIn);

  return (
    <div>
      <nav className="relative z-20">
        <RentersNavigation />
      </nav>
      <div className="z-10 mx-52 h-screen">
        <div className="grid grid-cols-2 gap-4 mt-16">
          <div className="h-96 flex justify-center items-center bg-white rounded-2xl drop-shadow-lg">
            <h1 className="font-montserrat text-xl font-bold">
              Image of {boardDetails?.BC_RenterRoomName}
            </h1>
          </div>
          <div className="grid grid-cols-2  gap-4">
            <div className="flex justify-center items-center bg-white drop-shadow-lg rounded-2xl">
              <h1 className="font-montserrat font-bold">
                {" "}
                {boardDetails?.BC_RenterRoomName}
              </h1>
            </div>
            <div className="flex justify-center items-center bg-white drop-shadow-lg rounded-2xl">
              <h1 className="font-montserrat font-bold">
                {" "}
                {boardDetails?.BC_RenterRoomName}
              </h1>
            </div>
            <div className="flex justify-center items-center bg-white drop-shadow-lg rounded-2xl">
              <h1 className="font-montserrat font-bold">
                {" "}
                {boardDetails?.BC_RenterRoomName}
              </h1>
            </div>
            <div className="flex justify-center items-center bg-white drop-shadow-lg rounded-2xl">
              <h1 className="font-montserrat font-bold">
                {boardDetails?.BC_RenterRoomName}
              </h1>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-5 mt-10 gap-10">
          <div className="col-span-3">
            <div className=" flex flex-row items-center gap-4">
              <div className="h-20 w-20 text-xs rounded-full bg-white drop-shadow-lg text-center flex items-center justify-center font-montserrat">
                Image of {boardDetails?.BC_BoarderFullName}
              </div>
              <div className="flex flex-col">
                <h1 className="font-montserrat font-medium">
                  Request:{" "}
                  <span className="font-bold capitalize">
                    {boardDetails?.BC_BoarderFullName}
                  </span>
                </h1>
                <p className="font-hind text-[#797979]">
                  {boardDetails?.BC_BoarderBoardedAt?.fromNow()}
                </p>
              </div>
            </div>
            <div className="mt-10 grid grid-cols-2">
              <div className="flex flex-col items-center">
                <h1 className="mb-6 font-montserrat font-bold text-2xl">
                  Selected Features
                </h1>
                {boardDetails?.BC_BoarderChoiceFeature?.map((data, index) => {
                  return (
                    <p className="font-hind text-lg" key={index}>
                      {data?.name}: Php {data?.value}
                    </p>
                  );
                })}
              </div>
              <div className="flex flex-col items-center">
                <h1 className="mb-6 font-montserrat font-bold text-2xl">
                  Dietary Restrictions
                </h1>
                <p className="font-hind text-lg flex flex-col">
                  {boardDetails?.BC_BoarderDietaryRestrictions}
                </p>
              </div>
            </div>

            <div className="w-full h-16 bg-white drop-shadow-lg rounded-lg mt-4 flex items-center">
              <div className="h-8 w-full flex flex-row items-center gap-4 justify-center">
                <h1 className="font-montserrat font-medium">
                  Type Of Payment:
                </h1>
                <Image
                  src={`/${boardDetails?.BC_TypeOfPayment} Image.svg`}
                  width={30}
                  height={30}
                  alt={`${boardDetails?.BC_TypeOfPayment}`}
                  className="object-contain h-9 w-9"
                />
                <p className="font-hind font-semibold">
                  {boardDetails?.BC_TypeOfPayment}
                </p>
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <div className="w-full h-fit p-4 bg-[#86B2B4] mt-6 rounded-lg">
              <div className="grid grid-cols-2 bg-[#DEE9E9] p-2 rounded-md">
                <div className="flex flex-col  px-4 border-b-2 border-r-2  border-[#C3C3C3]">
                  <h1 className="font-semibold font-montserrat">
                    Check In Date:
                  </h1>
                  <p className="font-hind">
                    {boardDetails?.BC_BoarderCheckInDate?.format(
                      "MMMM DD, YYYY"
                    )}
                  </p>
                  <p className="font-hind text-sm text-gray-500">
                    {boardDetails?.BC_BoarderCheckInTime?.format("hh:mm A")}
                  </p>
                </div>
                <div className="flex flex-col  px-4  border-b-2 border-[#C3C3C3]">
                  <h1 className="font-semibold font-montserrat">
                    Check Out Date:
                  </h1>
                  <p className="font-hind">
                    {boardDetails?.BC_BoarderCheckOutDate?.format(
                      "MMMM DD, YYYY"
                    )}
                  </p>
                  <p className="font-hind text-sm text-gray-500">
                    {boardDetails?.BC_BoarderCheckOutTime?.format("hh:mm A")}
                  </p>
                </div>
                <h1 className="col-span-2 flex flex-col font-medium font-montserrat mt-2">
                  Guest:
                  <span className="font-hind text-[#797979]">
                    {boardDetails?.BC_BoarderGuest}
                  </span>
                </h1>
                <h1 className="col-span-2 flex flex-col font-medium font-montserrat mt-2">
                  Total Price:
                  <span className="font-hind text-[#797979]">
                    Php {totalPrice}
                  </span>
                </h1>
              </div>
              <div className="grid grid-cols-2 mt-4 gap-3">
                {boardDetails?.BC_BoarderStatus === "Pending" ? (
                  <div className="col-span-2 grid grid-cols-2 gap-5">
                    <button className="bg-red-500 text-white py-1 font-hind rounded-lg">
                      Reject
                    </button>
                    <button
                      className="bg-[#006B95] text-white py-1 text-lg font-hind rounded-lg"
                      onClick={() => setAcceptModal(true)}
                    >
                      Accept
                    </button>
                  </div>
                ) : (
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <h1
                      className={`${
                        boardDetails?.BC_BoarderStatus === "Paid"
                          ? `col-span-2 `
                          : ` col-span-1`
                      } text-lg rounded-lg font-montserrat font-bold text-white bg-[#006B95] py-2 text-center`}
                    >
                      {boardDetails?.BC_BoarderStatus}
                    </h1>

                    {boardDetails?.BC_BoarderStatus === "Occupied" ? (
                      <button
                        className={`bg-[#006B95] text-white py-1 font-hind rounded-lg`}
                        onClick={() => setShowModalPaid(true)}
                      >
                        Click here if the user paid
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCheckedInModal(true)}
                        className={`${
                          boardDetails?.BC_BoarderStatus !== "Paid"
                            ? `block`
                            : `hidden`
                        }  bg-[#28e96b] text-white font-hind font-bold py-2 text-lg rounded-md`}
                      >
                        Checked In?
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={checkedInModal}
        centered
        onOk={() => {
          checkedInRoom(
            boardDetails?.boardId || "",
            boardDetails?.BC_RenterRoomName || "",
            boardDetails?.BC_RenterUID || "",
            boardDetails?.BC_BoarderUID || "",
            boardDetails?.BC_RenterRoomID || ""
          );
          setCheckedInModal(false);
        }}
        onCancel={() => setCheckedInModal(false)}
        onClose={() => setCheckedInModal(false)}
      >
        <h1 className="font-montserrat font-medium">
          Confirm {boardDetails?.BC_BoarderFullName} has checked-in in room{" "}
          {boardDetails?.BC_RenterRoomName}
        </h1>
      </Modal>
      <Modal
        open={acceptModal}
        centered
        onOk={() => {
          acceptedBooked(
            boardDetails?.boardId || "",
            totalPrice || 0,
            boardDetails?.BC_RenterUID || "",
            boardDetails?.BC_BoarderUID || "",
            boardDetails?.BC_RenterRoomID || ""
          );
          setAcceptModal(false);
        }}
        onCancel={() => setAcceptModal(false)}
        onClose={() => setAcceptModal(false)}
      >
        <h1 className="font-montserrat font-medium">
          Do you want to accept the book request of{" "}
          {boardDetails?.BC_BoarderFullName}
        </h1>
      </Modal>
      <Modal
        open={showModalPaid}
        onCancel={() => setShowModalPaid(false)}
        onClose={() => setShowModalPaid(false)}
        onOk={() => {
          setShowModalPaid(false);
          paidBooking(
            boardDetails?.boardId || "",
            boardDetails?.BC_RenterUID || "",
            boardDetails?.BC_RenterFullName || "",
            boardDetails?.BC_BoarderUID || "",
            boardDetails?.BC_BoarderFullName || "",
            boardDetails?.BC_RenterRoomName || "",
            boardDetails?.BC_RenterRoomID || ""
          );
        }}
        centered
      >
        Confirm payment of {boardDetails?.BC_BoarderFullName} in room{" "}
        {boardDetails?.BC_RenterRoomName}
      </Modal>
    </div>
  );
}
