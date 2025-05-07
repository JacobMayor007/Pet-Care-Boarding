"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Select } from "antd";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { app } from "@/app/firebase/config";
import RentersNavigation from "@/app/RentersNavigation/page";
import Loading from "@/app/Loading/page";
import { Dayjs } from "dayjs";

interface Feature {
  id: string;
  name: string;
  price: string;
}

interface RoomId {
  params: Promise<{ id: string }>;
}

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

type OptionValue = string;

export default function UpdateRoom({ params }: RoomId) {
  const { id } = React.use(params);
  const [typeOfPayment, setTypeOfPayment] = useState<OptionValue[]>([]);
  const [roomDescription, setRoomDescription] = useState<string>("");
  const [preview, setPreview] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [roomPrice, setRoomPrice] = useState<string | number>(0);
  const [roomFeature, setRoomFeatures] = useState<Feature[]>([]);
  const [typeOfRoom, setTypeOfRoom] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const db = getFirestore(app);

  const options = [
    { id: 1, label: "Cash On Hand", img: "./Cash On Hand Image.svg" },
    { id: 2, label: "GCash", img: "./GCash Image.svg" },
    { id: 3, label: "Debit Or Credit", img: "./Debit Or Credit Image.svg" },
  ];

  const fetchRoomData = useCallback(async () => {
    try {
      const roomRef = doc(db, "board", id);
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        const roomData = roomSnap.data() as myBoard;

        setRoomName(roomData.Renter_RoomName || "");
        setRoomDescription(roomData.Renter_RoomDescription || "");
        setRoomPrice(roomData.Renter_RoomPrice || 0);
        setTypeOfRoom(roomData.Renter_TypeOfRoom || "");
        setLocation(roomData.Renter_Location || "");

        // Handle payment methods
        if (roomData.Renter_PaymentMethod) {
          if (Array.isArray(roomData.Renter_PaymentMethod)) {
            setTypeOfPayment(roomData.Renter_PaymentMethod);
          } else {
            setTypeOfPayment([roomData.Renter_PaymentMethod]);
          }
        }

        // Handle room features
        if (roomData.Renter_RoomFeatures) {
          const features = Array.isArray(roomData.Renter_RoomFeatures)
            ? roomData.Renter_RoomFeatures
            : [];

          setRoomFeatures(
            features.map((feat) => ({
              id: uuidv4(),
              name: feat.name || "",
              price: feat.price || "",
            }))
          );
        }
      } else {
        console.log("No such room!");
        router.push("/Renters");
      }
    } catch (error) {
      console.error("Error fetching room:", error);
    } finally {
      setLoading(false);
    }
  }, [db, id, router]);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/Login");
      } else {
        fetchRoomData();
      }
    });
    return () => unsubscribe();
  }, [router, id, fetchRoomData]);

  const handleChange = (value: OptionValue[]) => {
    setTypeOfPayment(value);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const base64 = await getBase64(selectedFile);
      setPreview(base64);
    }
  };

  const addFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    setRoomFeatures([
      ...roomFeature,
      {
        id: uuidv4(),
        name: "",
        price: "",
      },
    ]);
  };

  const removeFeatures = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setRoomFeatures(roomFeature.filter((feature) => feature.id !== id));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const { name, value } = e.target;
    setRoomFeatures(
      roomFeature.map((feature) =>
        feature.id === id ? { ...feature, [name]: value } : feature
      )
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !roomName ||
      roomPrice === "0" ||
      !roomDescription ||
      !location ||
      !typeOfRoom
    ) {
      setErrorMessage(true);
      return;
    }

    try {
      const auth = getAuth(app);
      const user = auth.currentUser;

      if (!user) {
        router.push("/Login");
        return;
      }

      const roomRef = doc(db, "board", id);

      await updateDoc(roomRef, {
        Renter_RoomName: roomName,
        Renter_RoomDescription: roomDescription,
        Renter_RoomPrice: roomPrice,
        Renter_TypeOfRoom: typeOfRoom,
        Renter_Location: location,
        Renter_PaymentMethod: typeOfPayment,
        Renter_RoomFeatures: roomFeature,
        imageUrl: preview,
      });

      router.push("/");
    } catch (error) {
      console.error("Error updating room:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="h-full pb-5 relative">
      <RentersNavigation />

      <div className="h-full bg-white py-7 mr-4 pr-8 flex flex-row gap-5 ml-32 my-10 rounded-lg 2xl:px-36">
        <div className="h-full w-1/3 flex flex-col pt-16 px-8 gap-10">
          <div className="flex flex-col justify-start items-start">
            <h1 className="font-hind text-xl text-[#06005B] pb-2 flex flex-col">
              Board Information
              <span className="h-1 w-full bg-[#06005B] rounded-full" />
            </h1>
          </div>
          <div>
            <h1 className="font-hind text-xl text-[#06005B]">Review</h1>
          </div>
        </div>
        <div className="h-full w-2/3 pt-4 flex flex-col gap-3">
          <h1 className="text-2xl font-hind text-[#06005B] tracking-wide font-medium">
            Update Boarding
          </h1>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="bg-[#86B2B4] py-8 px-16 rounded-xl">
              <h1 className="text-base text-white font-hind font-medium tracking-wide mb-4">
                Image
              </h1>
              <div className="h-32 flex flex-row items-center px-4 border-white border-[1px] gap-2 rounded-md">
                {preview && (
                  <div>
                    <Image
                      className="object-contain h-16"
                      src={preview}
                      height={96}
                      width={96}
                      alt="Room Image"
                    />
                  </div>
                )}

                <label
                  htmlFor="image-file"
                  className="h-24 w-24 flex flex-col items-center justify-center rounded-md outline-dotted outline-2 outline-[#565656] hover:text-white hover:outline-blue-500 cursor-pointer"
                >
                  <span className="text-2xl">+</span>
                  Upload
                </label>
                <input
                  type="file"
                  accept="image/*"
                  name="images"
                  id="image-file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <div className="flex flex-col gap-3 my-5">
                <h1 className="text-base text-white font-hind font-medium">
                  Room Number / Name
                </h1>
                <input
                  className="border-[1px] border-white rounded-lg w-full h-10 px-3 outline-none bg-[#86B2B4] text-white placeholder:text-slate-500 placeholder:font-hind placeholder:font-medium placeholder:text-sm"
                  name="roomName"
                  type="text"
                  value={roomName}
                  placeholder="Ex. 18B"
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3 my-5">
                <h1 className="text-base text-white font-hind font-medium">
                  Type of Room
                </h1>
                <input
                  className="border-[1px] border-white rounded-lg w-full h-10 px-3 outline-none bg-[#86B2B4] text-white placeholder:text-slate-500 placeholder:font-hind placeholder:font-medium placeholder:text-sm"
                  name="roomType"
                  type="text"
                  value={typeOfRoom}
                  placeholder="Ex. Deluxe Room"
                  onChange={(e) => setTypeOfRoom(e.target.value)}
                />
              </div>

              <div>
                <h1 className="text-base text-white font-hind font-medium">
                  Description of the Room
                </h1>
                <textarea
                  className="border-[1px] border-white w-full resize-none rounded-md px-3 py-1 outline-none bg-[#86B2B4] text-white placeholder:text-slate-500 placeholder:font-hind placeholder:font-medium placeholder:text-sm"
                  name="room-description"
                  id="textarea-description"
                  cols={30}
                  rows={3}
                  placeholder="Ex. The Deluxe Room is a luxurious haven for pets..."
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                />
              </div>
              <div className="mt-2">
                <h1 className="text-base text-white font-hind font-medium">
                  Address
                </h1>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={location}
                  className="border-[1px] border-white rounded-lg w-full h-10 px-3 outline-none bg-[#86B2B4] text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-slate-500 placeholder:font-hind placeholder:font-medium placeholder:text-sm"
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="J & G Building, H Abellana, Canduman, Mandaue City, 6014 Cebu"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 bg-[#86B2B4] py-8 px-8 rounded-xl">
              {roomFeature.length > 0 && (
                <div className="flex flex-col gap-2 items-center py-5 rounded-lg">
                  {roomFeature.map((feature) => (
                    <div key={feature.id}>
                      <div className="xl:grid xl:grid-cols-[100px_200px_150px_200px_50px] xl:gap-3 items-center">
                        <label
                          htmlFor="name"
                          className="text-base font-hind font-medium text-white"
                        >
                          Feature:
                        </label>
                        <input
                          className="h-10 border-white border-[1px] rounded-md text-base font-hind font-normal px-2 bg-[#86B2B4] outline-none text-white placeholder:text-slate-500 placeholder:font-hind placeholder:font-medium placeholder:text-sm"
                          type="text"
                          name="name"
                          id="feature-name"
                          value={feature.name}
                          placeholder="Ex. Grooming"
                          onChange={(e) => handleInputChange(e, feature.id)}
                        />
                        <label
                          htmlFor="price"
                          className="text-base font-hind font-medium text-white"
                        >
                          Price on Feature:
                        </label>
                        <input
                          className="h-10 outline-none text-white border-white border-[1px] rounded-md text-base font-hind font-normal px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-[#86B2B4] placeholder:text-slate-500 placeholder:font-hind placeholder:font-medium placeholder:text-sm"
                          type="number"
                          name="price"
                          id="feature-price"
                          value={feature.price}
                          placeholder="Php 350"
                          onChange={(e) => handleInputChange(e, feature.id)}
                        />
                        <span
                          className="h-7 w-7 mt-5 xl:mt-0 rounded-full hover:bg-slate-500 hover:text-white flex items-center justify-center font-bold cursor-pointer border-[1px] border-white"
                          onClick={(e) => removeFeatures(feature.id, e)}
                        >
                          -
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <button
                  className="h-12 w-auto px-4 rounded-lg border-white border-[1px] font-hind font-medium tracking-wide cursor-pointer text-white"
                  onClick={addFeatures}
                >
                  Add More Feature +
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 bg-[#86B2B4] py-8 px-16 rounded-xl">
              <div>
                <h1 className="text-base font-hind font-medium text-white">
                  Price for a day
                </h1>
                <input
                  className="w-full bg-[#86B2B4] h-10 rounded-md px-2 outline-none text-base font-hind font-medium border-[1px] border-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-white"
                  name="roomPrice"
                  value={roomPrice == 0 ? "" : roomPrice}
                  onChange={(e) => setRoomPrice(Number(e.target.value))}
                  type="number"
                />
              </div>
              <div>
                <h1 className="text-white font-hind text-lg tracking-wide font-medium">
                  Type Of Payment
                </h1>
                <Select
                  mode="multiple"
                  allowClear
                  style={{
                    width: "100%",
                    backgroundColor: "#86B2B4",
                    fontFamily: "sans-serif",
                    fontWeight: "bold",
                  }}
                  placeholder="Please select"
                  onChange={handleChange}
                  value={typeOfPayment}
                  options={options.map((option) => ({
                    value: option.label,
                    label: option.label,
                  }))}
                />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between">
              <Link
                className="p-2 w-24 font-hind text-base border-[1px] border-black shadow-sm shadow-slate-500 flex items-center justify-center rounded-lg"
                href="/Renters"
              >
                Cancel
              </Link>

              <button
                className="cursor-pointer border-[1px] border-black p-2 w-24 rounded-lg text-base font-hind tracking-wide shadow-md shadow-gray-700 text-white bg-[#06005b] flex items-center justify-center"
                type="submit"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>

      {errorMessage && (
        <div className="h-[200vh] w-screen absolute top-0 z-[1]">
          <div className="h-full w-full absolute top-0 z-[1] blur-sm backdrop-blur-sm" />
          <div className="z-[2] relative flex-col mx-[40%] my-[20%]">
            <FontAwesomeIcon
              icon={faXmark}
              className="ml-64 cursor-pointer"
              onClick={() => setErrorMessage(false)}
            />
            <div className="p-4 bg-white rounded-lg flex flex-col w-auto">
              <h1 className="font-montserrat text-red-600 font-medium text-xl">
                Make sure to provide the following fields
              </h1>
              <p className="text-lg font-hind font-medium text-yellow-300">
                Room Name
              </p>
              <p className="text-lg font-hind font-medium text-yellow-300">
                Room Description
              </p>
              <p className="text-lg font-hind font-medium text-yellow-300">
                Room Price
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
