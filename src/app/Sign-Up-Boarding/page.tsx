"use client";

import { auth, provider } from "@/app/firebase/config";
import { FacebookOutlined, GoogleOutlined } from "@ant-design/icons";
import { FacebookAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { doc, getFirestore, setDoc, Timestamp } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import RegisterAs from "../RegisterAs/page";
import { Select } from "antd";
import Link from "next/link";

export default function RegisterAsDoctor() {
  const [checkBox, setCheckBox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show, setShow] = useState(false);
  const [usingAuth, setUsingAuth] = useState(false);
  const [confirmShow, setConfirmShow] = useState(false);

  const [formData, setFormData] = useState({
    fName: "",
    lName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contact: "",
    propertyAddress: "",
    petTypes: [],
    propertyName: "",
  });
  const router = useRouter();

  const [createUserWithEmailAndPassword, loading] =
    useCreateUserWithEmailAndPassword(auth);
  const db = getFirestore();

  const options = [
    { label: "Dogs", value: "dogs" },
    { label: "Cats", value: "cats" },
    { label: "Birds", value: "birds" },
    { label: "Reptiles", value: "reptiles" },
    { label: "Exotic Animal", value: "exotic animal" },
  ];

  const handleSignUp = async () => {
    try {
      const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (isSubmitting) return;

      setIsSubmitting(true);

      // Basic Validation
      if (
        !formData.fName ||
        !formData.lName ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword ||
        !formData.contact ||
        !formData.petTypes ||
        !formData.propertyAddress ||
        !formData.propertyName
      ) {
        alert("All fields are required.");
        setIsSubmitting(false); // Re-enable the button
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        setIsSubmitting(false); // Re-enable the button
        return;
      }

      if (!regex.test(formData.password)) {
        alert(
          "Please input atleast one uppercase, lowercase, and one special character, and number!"
        );
        setIsSubmitting(false); // Re-enable the button
        return;
      }

      if (!checkBox) {
        alert("Please check the terms and conditions");
        setIsSubmitting(false); // Re-enable the button
        return;
      }

      // Create user with Firebase Authentication
      const res = await createUserWithEmailAndPassword(
        formData.email,
        formData.password
      );
      if (!res || !res.user) {
        throw new Error("Failed to create user. Please try again.");
      }

      // Add user data to Firestore
      const userRef = doc(db, "Users", res.user.uid);

      await setDoc(userRef, {
        User_Name: formData.fName + " " + formData.lName,
        User_Email: formData.email,
        User_UID: res.user.uid,
        TermsAndConditions: checkBox,
        CreatedAt: Timestamp.now(),
      });

      const roomProviderRef = doc(db, "room-provider", res.user.uid);

      await setDoc(roomProviderRef, {
        room_provider_fullName: formData.fName + " " + formData.lName,
        room_provider_email: formData.email,
        room_provider_uid: res.user.uid,
        terms_and_conditions: checkBox,
        createdAt: Timestamp.now(),
        room_provider_info: {
          contact: formData.contact,
          property_name: formData.propertyName,
          property_address: formData.propertyAddress,
          types_of_pet_to_cater: formData.petTypes,
        },
      });

      // Clear input fields
      setFormData({
        fName: "",
        lName: "",
        email: "",
        password: "",
        confirmPassword: "",
        contact: "",
        petTypes: [],
        propertyAddress: "",
        propertyName: "",
      });

      // Redirect to login page or home page
      router.push("/Login");
    } catch (error) {
      console.error("Error during sign-up:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const googleAuth = async () => {
    try {
      if (
        !formData.contact ||
        !formData.petTypes ||
        !formData.propertyAddress ||
        !formData.propertyName ||
        !checkBox
      ) {
        alert("Please input all requirement fields");
        setUsingAuth(true);
        return new Error("Please input all requirement fields");
      }

      const result = await signInWithPopup(auth, provider);
      console.log(result.providerId);

      const userRef = doc(db, "Users", result.user.uid);
      const roomProviderRef = doc(db, "room-provider", result.user.uid);
      await setDoc(userRef, {
        User_Name: formData.fName + " " + formData.lName,
        User_Email: formData.email,
        User_UID: result.user.uid,
        TermsAndConditions: checkBox,
        CreatedAt: Timestamp.now(),
      });

      await setDoc(roomProviderRef, {
        room_provider_fullName: formData.fName + " " + formData.lName,
        room_provider_email: formData.email,
        room_provider_uid: result.user.uid,
        terms_and_conditions: checkBox,
        createdAt: Timestamp.now(),
        room_provider_info: {
          contact: formData.contact,
          property_name: formData.propertyName,
          property_address: formData.propertyAddress,
          types_of_pet_to_cater: formData.petTypes,
        },
      });

      if (result) {
        router.push("/");
      } else {
        router.push("/Sign-Up");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const facebookAuth = async () => {
    try {
      if (
        !formData.contact ||
        !formData.petTypes ||
        !formData.propertyAddress ||
        !formData.propertyName ||
        !checkBox
      ) {
        alert("Please input all requirement fields");
        setUsingAuth(true);
        return new Error("Please input all requirement fields");
      }

      const result = await signInWithPopup(
        getAuth(),
        new FacebookAuthProvider()
      );
      const userRef = doc(db, "Users", result.user.uid);
      const roomProviderRef = doc(db, "room-provider", result.user.uid);
      await setDoc(userRef, {
        User_Name: formData.fName + " " + formData.lName,
        User_Email: formData.email,
        User_UID: result.user.uid,
        TermsAndConditions: checkBox,
        CreatedAt: Timestamp.now(),
      });

      await setDoc(roomProviderRef, {
        room_provider_fullName: formData.fName + " " + formData.lName,
        room_provider_email: formData.email,
        room_provider_uid: result.user.uid,
        terms_and_conditions: checkBox,
        createdAt: Timestamp.now(),
        room_provider_info: {
          contact: formData.contact,
          property_name: formData.propertyName,
          property_address: formData.propertyAddress,
          types_of_pet_to_cater: formData.petTypes,
        },
      });
      if (result) {
        router.push("/");
      } else {
        router.push("/Sign-Up");
      }
      console.log("Facebook Sign In", result);
    } catch (err) {
      console.log(err);
    }
  };

  console.log(formData.petTypes);

  return (
    <div className="bg-[#9FE1DB] bg-signUp h-screen">
      <div className="xl:h-full 2xl:h-screen flex flex-row">
        <div className="w-[30%]">
          <h1 className="text-5xl font-sigmar font-normal text-white mt-10 text-center">
            Pet Care Pro
          </h1>
          <Image
            src="/Logo.svg"
            width={626}
            height={650}
            alt="Logo Icon"
            className="object-contain mt-8"
          />
        </div>
        <div className="w-[70%] rounded-[25px_0px_0px_25px] z-[2] bg-white flex flex-col px-20 gap-7">
          <div className="mt-5 flex flex-row items-center justify-between gap-2">
            <div className="flex flex-row items-center gap-2">
              <Image
                src="/PawPrint.svg"
                height={50}
                width={50}
                alt="Paw Print Icon"
              />
              <h1 className="text-3xl font-montserrat font-bold">
                Boarding&#39;s Registration
              </h1>
            </div>
            <div className="relative z-20 border-2 cursor-pointer font-medium font-montserrat border-gray-300 rounded-lg drop-shadow-md w-fit gap-2 text-center h-10 flex items-center ">
              <RegisterAs />
            </div>
          </div>
          <form
            className="flex flex-col gap-7 z-10"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
          >
            <div className={usingAuth ? `hidden` : `grid grid-cols-2 gap-5`}>
              <div className="relative ">
                <label
                  className="absolute left-7 -top-3 bg-white text-sm font-hind w-fit text-nowrap"
                  htmlFor="fName"
                >
                  First Name{" "}
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  name="first-name"
                  id="fName"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md text-base font-hind px-2"
                  value={formData.fName}
                  onChange={(e) =>
                    setFormData({ ...formData, fName: e.target.value })
                  }
                />
              </div>
              <div className="relative  ">
                <label
                  className="absolute left-7 -top-3  bg-white text-sm  font-hind"
                  htmlFor="lName"
                >
                  Last Name
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  name="last name"
                  id="lName"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md text-base font-hind px-2"
                  value={formData.lName}
                  onChange={(e) =>
                    setFormData({ ...formData, lName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className={`grid grid-cols-2 gap-5`}>
              <div className={usingAuth ? `hidden` : `relative`}>
                <label
                  className="absolute left-7 -top-3  bg-white text-sm  font-hind"
                  htmlFor="email-address"
                >
                  Email Address
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  name="emailAdd"
                  id="email-address"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md text-base font-hind px-2"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="relative border-solid border-black rounded-md border-[1px] pl-1 pr-2 flex flex-row items-center">
                <label
                  className="absolute left-7 z-20 -top-3 bg-white text-sm font-hind"
                  htmlFor="phone-number"
                >
                  Phone Number
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <p className="  bg-white py-1 px-1 font-montserrat font-medium drop-shadow-md rounded-md">
                  +63
                </p>
                <input
                  type="number"
                  name="Phone"
                  id="phone-number"
                  maxLength={10}
                  onKeyDown={(event) => {
                    if (
                      event.key == "." ||
                      event.key === "-" ||
                      event.key === "e" ||
                      event.key === "0" ||
                      event.key === "+"
                    ) {
                      event.preventDefault();
                    }
                  }}
                  className="h-12 w-full outline-none text-base font-hind px-2 [&::-webkit-inner-spin-button]:appearance-none"
                  value={formData.contact}
                  onChange={(e) => {
                    const inputValue = e.target.value;

                    // Enforce a maximum length of 10 characters
                    if (inputValue.length <= 10) {
                      setFormData({ ...formData, contact: inputValue });
                    } else {
                      // Truncate the value if it exceeds 10 characters
                      setFormData({
                        ...formData,
                        contact: inputValue.slice(0, 10),
                      });
                    }
                  }}
                />
              </div>
            </div>
            <div className={usingAuth ? `hidden` : `grid grid-cols-2 gap-5`}>
              <div className="relative">
                <label
                  htmlFor="password"
                  className="absolute left-7 -top-3 bg-white text-sm  font-hind"
                >
                  Password
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type={show ? `text` : `password`}
                  name="password"
                  id="password"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text base px-2"
                  value={formData.password}
                  minLength={8}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <div className="absolute right-3 bottom-4">
                  <Image
                    src={show ? `/Eyeopen.png` : `/icon _eye close_.svg`}
                    height={33.53}
                    width={19}
                    alt="Show Password icon"
                    className="object-contain cursor-pointer"
                    draggable={false}
                    onClick={() => setShow((prev) => !prev)}
                  />
                </div>
              </div>
              <div className="relative">
                <label
                  htmlFor="confirmPassword"
                  className="absolute left-7 -top-3 bg-white text-sm font-hind"
                >
                  Confirm Password
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type={confirmShow ? `text` : `password`}
                  name="confirm password"
                  id="confirmPassword"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text-base px-2"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <div className="absolute right-3 bottom-4">
                  <Image
                    src={confirmShow ? `/Eyeopen.png` : `/icon _eye close_.svg`}
                    height={33.53}
                    width={19}
                    alt="Show Password icon"
                    draggable={false}
                    className="object-contain cursor-pointer"
                    onClick={() => setConfirmShow((prev) => !prev)}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-5">
              <div className="relative col-span-6">
                <label
                  htmlFor="property-address"
                  className="absolute left-7 -top-3  bg-white text-sm  font-hind"
                >
                  Property Address
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type={`text`}
                  name="business"
                  id="property-address"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text base px-2"
                  value={formData.propertyAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      propertyAddress: e.target.value,
                    })
                  }
                />
              </div>
              <div className="relative col-span-3 w-full">
                <label
                  htmlFor="propertyName"
                  className="absolute left-7 -top-3  bg-white text-sm text-nowrap font-hind"
                >
                  Property Name
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type={`text`}
                  name="propertyName"
                  id="property-name"
                  className="h-12 border-[1px] border-solid border-black outline-none rounded-md font-hind text base px-2"
                  value={formData.propertyName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      propertyName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="relative col-span-3 flex items-center">
                <label
                  htmlFor="business-name"
                  className="absolute left-7 z-20 -top-3  bg-white text-sm text-nowrap font-hind"
                >
                  Pet Types Catered:
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <Select
                  mode="multiple"
                  allowClear
                  options={options}
                  onChange={(value) =>
                    setFormData({ ...formData, petTypes: value })
                  }
                  className="h-full w-full border-[1px] border-solid border-black rounded-md text-nowrap  outline-none"
                />
              </div>
            </div>

            <div className="flex flex-row gap-3">
              <input
                type="checkbox"
                name="agree"
                id="agreeTandT"
                className="w-6 h-6 text-base font-hind px-2"
                checked={checkBox}
                onChange={() => setCheckBox((prev) => !prev)}
              />
              <label htmlFor="agreeTandT" className="cursor-pointer">
                I agree to the{" "}
                <span className="text-[#4ABEC5] text-base font-hind">
                  Terms
                </span>{" "}
                and{" "}
                <span className="text-[#4ABEC5] text-base font-hind">
                  Conditions
                </span>
                <span className="text-red-500 text-sm font-montserrat ml-1">
                  *
                </span>
              </label>
            </div>
            <div>
              <p>
                Already have an account?{" "}
                <span className="text-base font-hind text-[#4ABEC5]">
                  <Link href="/Login">Log in here</Link>
                </span>
              </p>
            </div>
            <div>
              <button
                type="submit"
                id="signup-button"
                className={`w-[200px] h-[50px] ${
                  isSubmitting
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#6BE8DC] hover:bg-blue-400"
                } text-[22px] font-montserrat font-bold text-white rounded-lg`}
                disabled={Boolean(isSubmitting || loading)}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </div>
            <div className="w-[600px] h-20 grid grid-cols-3 gap-4">
              <div
                className="h-16 flex items-center drop-shadow-lg justify-center rounded-full border-[#C3C3C3] border-[1px] gap-4 cursor-pointer"
                onClick={googleAuth}
              >
                <GoogleOutlined className="text-4xl text-green-500" />
                <h1 className="text-2xl font-hind">Google</h1>
              </div>
              <div
                className="h-16 flex items-center drop-shadow-lg justify-center rounded-full border-[#C3C3C3] border-[1px] gap-4 cursor-pointer"
                onClick={facebookAuth}
              >
                <FacebookOutlined className="text-4xl text-blue-500" />
                <h1 className="text-2xl font-hind">Facebook</h1>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
