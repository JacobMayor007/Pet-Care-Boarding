"use client";

import RentersNavigation from "./RentersNavigation/page";

import { useEffect, useState } from "react";
import { DocumentData, Timestamp } from "firebase/firestore";
import {
  myRooms,
  myEarnings,
  totalEarnings,
  fetchMyDataBoarders,
  ongoingRoom,
  upcomingRoom,
  completedRoom,
} from "./fetchData/renterData";
import dayjs, { Dayjs } from "dayjs";
import { Rate } from "antd";
import { useRouter } from "next/navigation";
import fetchUserData, { isAuthenticate } from "./fetchData/fetchUserData";
import { auth } from "./firebase/config";

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

interface MonthlyEarnings {
  BC_BoarderPaidAt: Dayjs | null;
  BC_BoarderTotalPrice: number;
}

interface DailyEarnings {
  BC_BoarderPaidAt: Dayjs | null;
  BC_BoarderTotalPrice: number;
}

interface TotalEarnings {
  BC_BoarderTotalPrice: number;
}

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

export default function RentersPage() {
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [myBoards, setMyBoards] = useState<myBoard[]>([]);
  const [monthlyProfit, setMonthlyProfit] = useState(0);
  const [dailyProfit, setDailyProfit] = useState(0);
  const [totalProfit, setTotalProfit] = useState<number | null>(null);
  const [boarders, setBoarders] = useState<myBoarders[]>([]);
  const [onGoing, setOnGoing] = useState(0);
  const [upcoming, setUpcoming] = useState(0);
  const [completed, setCompleted] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      const login = await isAuthenticate();
      if (login) {
        router.push("/");
      } else {
        router.push("/Login");
      }
    };

    checkAuthentication();
  }, [router]);

  useEffect(() => {
    console.log(auth.currentUser);
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      const user = await fetchUserData();
      setUserData(user);
    };
    getUserData();
  }, []);

  useEffect(() => {
    const getMyRooms = async () => {
      const userID = userData[0]?.User_UID;
      const rooms = await myRooms(userID);

      setMyBoards(
        rooms?.map((room: myBoard) => ({
          ...room,
          Renter_CreatedAt: room?.Renter_CreatedAt
            ? dayjs(room?.Renter_CreatedAt.toDate())
            : null,
        }))
      );
    };
    getMyRooms();
  }, [userData]);

  useEffect(() => {
    const getMonthlyEarnings = async () => {
      const userUID = userData[0]?.User_UID;
      console.log(userUID);

      try {
        const getEarnings = await myEarnings(userUID);

        // Get the current month (0-based index, e.g., January = 0, February = 1, etc.)
        const currentMonth = dayjs().month();

        // Filter and sum the totalPrice for the current month
        const result = getEarnings
          ?.filter((earn: MonthlyEarnings) => {
            const paidAt = earn?.BC_BoarderPaidAt?.toDate();
            return paidAt && paidAt.getMonth() === currentMonth; // Check if the month matches
          })
          .reduce(
            (sum, earn) => {
              const totalPrice = earn?.BC_BoarderTotalPrice || 0;
              return {
                totalPrice: sum.totalPrice + totalPrice,
                count: sum.count + 1,
              };
            },
            { totalPrice: 0, count: 0 }
          );
        setMonthlyProfit(result?.totalPrice);
      } catch (error) {
        console.error(error);

        return 0;
      }
    };
    getMonthlyEarnings();
  }, [userData]);

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

  console.log("Get Boarders: ", boarders);

  useEffect(() => {
    const getDailyEarnings = async () => {
      const userUID = userData[0]?.User_UID;
      console.log(userUID);

      try {
        const getEarnings = await myEarnings(userUID);

        const now = dayjs().get("day");

        // Filter and sum the totalPrice for the current month
        const result = getEarnings
          ?.filter((earn: DailyEarnings) => {
            const paidAt = earn?.BC_BoarderPaidAt?.toDate();
            return paidAt && paidAt.getDay() === now;
          })
          .reduce(
            (sum, earn) => {
              const totalPrice = earn?.BC_BoarderTotalPrice || 0;
              return {
                totalPrice: sum.totalPrice + totalPrice,
                count: sum.count + 1,
              };
            },
            { totalPrice: 0, count: 0 }
          );
        setDailyProfit(result?.totalPrice);
      } catch (error) {
        console.error(error);

        return 0;
      }
    };
    getDailyEarnings();
  }, [userData]);

  useEffect(() => {
    const getTotalEarnings = async () => {
      try {
        const userUID = userData[0]?.User_UID;
        const earnings = await totalEarnings(userUID);

        const result = earnings?.reduce((sum: number, earn: TotalEarnings) => {
          return sum + earn?.BC_BoarderTotalPrice;
        }, 0);

        console.log("Total Profit", result);

        setTotalProfit(result || 0);
      } catch (error) {
        console.error("Error calculating total earnings:", error);
        return null;
      }
    };

    getTotalEarnings();
  }, [userData]);

  useEffect(() => {
    const getOnGoingRoom = async () => {
      const userUID = userData[0]?.User_UID;
      try {
        const onGoing = await ongoingRoom(userUID);
        setOnGoing(onGoing || 0);
      } catch (error) {
        console.error(error);
      }
    };
    getOnGoingRoom();
  }, [userData]);

  useEffect(() => {
    const getUpcomingRoom = async () => {
      const userUID = userData[0]?.User_UID;
      try {
        const upcoming = await upcomingRoom(userUID);
        setUpcoming(upcoming || 0);
      } catch (error) {
        console.error(error);
      }
    };
    getUpcomingRoom();
  }, [userData]);

  useEffect(() => {
    const getCompletedRoom = async () => {
      const userUID = userData[0]?.User_UID;
      try {
        const completed = await completedRoom(userUID);
        console.log("Hello: ", completed);

        setCompleted(completed || 0);
      } catch (error) {
        console.error(error);
      }
    };
    getCompletedRoom();
  }, [userData]);

  return (
    <div className="">
      <nav className="relative z-20">
        <RentersNavigation />
      </nav>
      <div className="z-10 mx-40 h-full pb-8 pt-14 flex flex-col gap-6">
        <h1 className="font-montserrat font-bold text-4xl">Rooms</h1>
        <div className="grid grid-cols-4 gap-4 items-center">
          {myBoards.slice(0, 4).map((data, index) => {
            return (
              <div
                key={index}
                className="bg-white drop-shadow-lg h-72 w-64 p-4 rounded-lg flex flex-col gap-4"
              >
                <div className="h-1/2 ">
                  <h1 className="text-center mt-10 font-montserrat font-bold">
                    Image Room of {data?.Renter_RoomName}
                  </h1>
                </div>
                <p className="font-montserrat text-sm text-[#565656] font-medium">
                  {data?.Renter_TypeOfRoom}
                </p>
                <p className="font-hind text-[#565656] font-bold text-lg">
                  {data?.Renter_RoomName}
                </p>
                <p className="font-semibold font-hind text-[#565656] ">
                  Php {data?.Renter_RoomPrice}
                </p>
                <a
                  href={`/Renter/ListOfRooms/${data?.id}`}
                  className="bg-[#006B95] font-hind text-white font-semibold py-0.5 rounded-md text-center"
                >
                  View Room Details
                </a>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-7">
          <h1 className="font-montserrat text-[#393939] font-bold text-4xl col-span-3 h-fit">
            Bookings
          </h1>
          <div className="h-32 bg-white drop-shadow-lg rounded-lg flex justify-center items-center">
            {onGoing === 0 ? (
              <p className="text-[#565656] font-montserrat font-semibold text-lg">
                No Boarders
                <span className="text-[#26A2AB] text-base block">On Going</span>
              </p>
            ) : (
              <div className="m-auto">
                <h1 className="text-center font-montserrat font-semibold text-[#26A2AB] text-2xl">
                  {onGoing}
                </h1>
                <p className="font-montserrat font-semibold text-[#565656] ">
                  On Going
                </p>
              </div>
            )}
          </div>
          <div className="h-32 bg-white drop-shadow-lg rounded-lg flex justify-center items-center">
            {upcoming === 0 ? (
              <p className="text-[#565656] font-montserrat font-semibold text-lg">
                No Boarders
                <span className="text-[#26A2AB] text-base block">Upcoming</span>
              </p>
            ) : (
              <div className="m-auto">
                <h1 className="text-center font-montserrat font-semibold text-[#26A2AB] text-2xl">
                  {upcoming}
                </h1>
                <p className="font-montserrat font-semibold text-[#565656] text-lg">
                  Upcoming
                </p>
              </div>
            )}
          </div>
          <div className="h-32 bg-white drop-shadow-lg rounded-lg flex justify-center items-center">
            {completed === 0 ? (
              <p className="text-[#565656] font-montserrat font-semibold text-lg">
                No Boarders
              </p>
            ) : (
              <div className="">
                <h1 className="text-center font-montserrat font-semibold text-[#26A2AB] text-2xl">
                  {completed}
                </h1>
                <p className="font-montserrat font-semibold text-[#565656] text-lg">
                  Completed
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-10 mt-4">
          <h1 className="font-montserrat font-bold text-4xl col-span-5">
            Summary
          </h1>
          <div className="flex flex-col gap-6 col-span-6 mr-4">
            <div className="h-36 bg-white drop-shadow-lg rounded-lg p-4 mt-4 grid grid-cols-3">
              <h1 className="font-semibold font-montserrat text-[#565656] text-2xl col-span-3">
                Earnings
              </h1>
              <p className="text-center font-montserrat text-xs text-[#565656]">
                Daily
              </p>
              <p className="text-center font-montserrat text-xs text-[#565656]">
                Monthly
              </p>
              <p className="text-center font-montserrat text-xs text-[#565656]">
                Total Earnings
              </p>
              <h1 className="text-center font-montserrat font-semibold text-lg text-[#26A2AB] ">
                Php {dailyProfit}
              </h1>
              <h1 className="text-center font-montserrat font-semibold text-lg text-[#26A2AB] ">
                Php {monthlyProfit}
              </h1>
              <h1 className="text-center font-montserrat font-semibold text-lg text-[#26A2AB] ">
                Php {totalProfit}
              </h1>
            </div>
            <div className="h-64 bg-white drop-shadow-lg rounded-md p-5 overflow-y-scroll overflow-hidden">
              <h1 className="text-[#565656] font-montserrat font-semibold text-2xl mb-2">
                Customer Ratings
              </h1>

              {boarders.map((data) => {
                return (
                  <div
                    key={data?.id}
                    className={
                      data?.BC_BoarderFeedback || data?.BC_BoarderRate
                        ? `flex flex-row gap-4`
                        : `hidden`
                    }
                  >
                    <h1 className="text-[#006B95] font-hind">
                      Customer{" "}
                      <span className="text-[#06005B]">
                        {data?.BC_BoarderFullName}
                      </span>{" "}
                      has given a {data?.BC_BoarderRate} rating to your room and
                      services
                    </h1>
                    <Rate defaultValue={data?.BC_BoarderRate} disabled />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ml-4 col-span-4 bg-white drop-shadow-lg rounded-lg py-5 px-7 flex flex-col gap-4 overflow-y-scroll overflow-hidden">
            <h1 className="font-montserrat text-[#565656] font-bold text-2xl">
              Transactions
            </h1>

            <div className="grid grid-cols-5 gap-4 items-center ">
              <h1 className="text-[#565656] font-montserrat font-medium text-sm text-center">
                Room Name
              </h1>
              <h1 className="text-[#565656] font-montserrat font-medium text-sm text-center">
                Customer
              </h1>
              <h1 className="text-[#565656] font-montserrat font-medium text-sm text-center">
                Room Type
              </h1>
              <h1 className="text-[#565656] font-montserrat font-medium text-sm text-center">
                Amount
              </h1>
              <h1 className="text-[#565656] font-montserrat font-medium text-sm text-center">
                Status
              </h1>
              {boarders.map((data) => {
                return (
                  <div
                    key={data?.id}
                    className="col-span-5 grid grid-cols-5 gap-4 items-center "
                  >
                    <p className="font-hind text-[#3A2A69] text-sm text-center font-medium">
                      {data?.BC_RenterRoomName}
                    </p>
                    <p className="font-hind text-[#0389BD] font-medium">
                      {data?.BC_BoarderFullName}
                    </p>
                    <p className="font-hind text-[#3A2A69] text-sm text-center font-medium">
                      {data?.BC_BoarderTypeRoom}
                    </p>
                    <p className="font-hind text-[#3A2A69] text-sm text-center font-medium">
                      Php {data?.BC_BoarderTotalPrice}
                    </p>
                    <p className="text-[#862B2B] text-center font-hind text-sm font-bold">
                      {data?.BC_BoarderStatus}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
