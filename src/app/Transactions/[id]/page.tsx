"use client";

import React, { useEffect, useState } from "react";
import RentersNavigation from "../../RentersNavigation/page";
import "@ant-design/v5-patch-for-react-19";
import dayjs from "dayjs";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import Image from "next/image";
import { Modal, Rate } from "antd";
import "@ant-design/v5-patch-for-react-19";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isTomorrow from "dayjs/plugin/isTomorrow";
import { acceptedBooked, paidBooking, checkedInRoom } from "../renterData";
import { db } from "@/app/firebase/config";

dayjs.extend(isTomorrow);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrAfter);

interface boardID {
  params: Promise<{ id: string }>;
}

interface Feature {
  label?: string;
  name?: string;
  value?: string;
}

interface BoardDetails {
  boardId?: string;
  BC_BoarderUID?: string;
  BC_BoarderFullName?: string;
  BC_BoarderEmail?: string;
  BC_BoarderBoardedAt?: dayjs.Dayjs | null;
  BC_BoarderCheckInTime?: dayjs.Dayjs | null;
  BC_BoarderCheckOutTime?: dayjs.Dayjs | null;
  BC_BoarderCheckInDate?: dayjs.Dayjs | null;
  BC_BoarderCheckOutDate?: dayjs.Dayjs | null;
  BC_BoarderChoiceFeature?: Feature[];
  BC_BoarderDays?: number;
  BC_BoarderDietaryRestrictions?: string;
  BC_BoarderGuest?: number;
  BC_BoarderStatus?: string;
  BC_BoarderUpdated?: dayjs.Dayjs | null;
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

interface Rated {
  id?: string;
  Renter_Room_Total_Rating?: number;
}

export default function RoomDetails({ params }: boardID) {
  const { id } = React.use(params);
  const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
  const [featureValue, setFeatureValue] = useState<Value | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [roomRate, setRoomRate] = useState<Rated | null>(null);
  const [acceptModal, setAcceptModal] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [showModalPaid, setShowModalPaid] = useState(false);
  const [checkedInModal, setCheckedInModal] = useState(false);

  useEffect(() => {
    const getRoomDetails = async () => {
      try {
        const docRef = doc(db, "boarders", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Convert Timestamps to Dayjs
          const convertTimestamp = (ts: Timestamp | undefined) =>
            ts instanceof Timestamp ? dayjs(ts.toDate()) : null;

          const result: BoardDetails = {
            boardId: docSnap.id,
            BC_BoarderUID: data.BC_BoarderUID,
            BC_BoarderFullName: data.BC_BoarderFullName,
            BC_BoarderEmail: data.BC_BoarderEmail,
            BC_BoarderBoardedAt: convertTimestamp(data.BC_BoarderBoardedAt),
            BC_BoarderCheckInTime: convertTimestamp(data.BC_BoarderCheckInTime),
            BC_BoarderCheckOutTime: convertTimestamp(
              data.BC_BoarderCheckOutTime
            ),
            BC_BoarderCheckInDate: convertTimestamp(data.BC_BoarderCheckInDate),
            BC_BoarderCheckOutDate: convertTimestamp(
              data.BC_BoarderCheckOutDate
            ),
            BC_BoarderChoiceFeature: Array.isArray(data.BC_BoarderChoiceFeature)
              ? data.BC_BoarderChoiceFeature
              : [{ label: "", name: "", value: 0 }],
            BC_BoarderDays: data.BC_BoarderDays || 0,
            BC_BoarderDietaryRestrictions:
              data.BC_BoarderDietaryRestrictions || "None",
            BC_BoarderGuest: data.BC_BoarderGuest || 0,
            BC_BoarderStatus: data.BC_BoarderStatus || "Unknown",
            BC_BoarderUpdated: convertTimestamp(data.BC_BoarderUpdated),
            BC_BoarderTypeRoom: data.BC_BoarderTypeRoom || "",
            BC_RenterRoomID: data.BC_RenterRoomID,
            BC_RenterFullName: data.BC_RenterFullName,
            BC_RenterUID: data.BC_RenterUID,
            BC_RenterRoomName: data.BC_RenterRoomName,
            BC_RenterPrice: data.BC_RenterPrice,
            BC_RenterLocation: data.BC_RenterLocation,
            BC_RenterEmail: data.BC_RenterEmail,
            BC_TypeOfPayment: data.BC_TypeOfPayment || "Unknown",
            BC_BoarderTotalPrice: data.BC_BoarderTotalPrice || 0,
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

  useEffect(() => {
    if (boardDetails?.BC_BoarderChoiceFeature) {
      // Convert string values to numbers safely
      const featureValues = boardDetails.BC_BoarderChoiceFeature.map((data) =>
        data?.value ? Number(data.value) : 0
      ).filter((value) => !isNaN(value)); // ✅ filter out NaN

      setFeatureValue({ features: featureValues });
    }
  }, [boardDetails]);

  useEffect(() => {
    const totalFeatureValue =
      featureValue?.features?.reduce((a, b) => a + b, 0) || 0;

    const renterPrice = Number(boardDetails?.BC_RenterPrice) || 0;

    const total = totalFeatureValue + renterPrice;

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

  useEffect(() => {
    const getRateAndFeedback = async () => {
      try {
        const docRef = doc(db, "board", boardDetails?.BC_RenterRoomID || "");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const result = { id: docSnap.id, ...(docSnap.data() as Rated) };
          setRoomRate(result);
        }
      } catch (error) {
        console.error(error);
      }
    };
    getRateAndFeedback();
  }, [boardDetails]);

  const rejectHandle = async () => {
    try {
      const docRef = doc(db, "boarders", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          BC_BoarderStatus: "Reject",
        });

        const fbNotifRef = collection(db, "notifications");
        await addDoc(fbNotifRef, {
          createdAt: Timestamp.now(),
          hide: false,
          open: false,
          message: `You have been rejected to board ${boardDetails?.BC_RenterRoomName}`,
          room_ID: id,
          receiverID: boardDetails?.BC_BoarderUID,
          senderID: boardDetails?.BC_RenterUID,
          status: "unread",
          title: `Rejected   ${boardDetails?.BC_BoarderUID} booking`,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  console.log(checkedIn);

  return (
    <div>
      <nav className="relative z-20">
        <RentersNavigation />
      </nav>
      <div className="z-10 mx-52 h-screen">
        <div className="grid grid-cols-2 gap-4 mt-16">
          <div className="col-span-2 flex justify-end">
            <Rate value={roomRate?.Renter_Room_Total_Rating} disabled />
          </div>
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
                {boardDetails?.BC_BoarderChoiceFeature?.length ? (
                  boardDetails?.BC_BoarderChoiceFeature.map((data, index) => (
                    <p className="font-hind text-lg" key={index}>
                      {data?.name}: ₱{data?.value?.toLocaleString()}
                    </p>
                  ))
                ) : (
                  <p className="font-hind text-lg">No features selected</p>
                )}
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
              {boardDetails?.BC_BoarderStatus !== "Reject" ? (
                <div className="grid grid-cols-2 mt-4 gap-3">
                  {boardDetails?.BC_BoarderStatus === "Pending" ? (
                    <div className="col-span-2 grid grid-cols-2 gap-5">
                      <button
                        onClick={() => setRejectModal(true)}
                        className="bg-red-500 text-white py-1 font-hind rounded-lg"
                      >
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
              ) : (
                <div className="font-montserrat font-bold text-[#393939] flex justify-center">
                  <h1 className="px-7 py-2 bg-red-600 text-white rounded-md">
                    {boardDetails?.BC_BoarderStatus}
                  </h1>
                </div>
              )}
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
          <span className="font-montserrat font-bold text-[#006B95] capitalize">
            {boardDetails?.BC_BoarderFullName}
          </span>{" "}
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
      <Modal
        open={rejectModal}
        onClose={() => setRejectModal(false)}
        onCancel={() => setRejectModal(false)}
        onOk={() => {
          setRejectModal(false);
          rejectHandle();
        }}
        centered
      >
        <h1>
          Do you want to confirm to reject the booking request of{" "}
          <span className="font-montserrat font-bold text-[#006B95] capitalize">
            {boardDetails?.BC_BoarderFullName}
          </span>
        </h1>
      </Modal>
    </div>
  );
}
