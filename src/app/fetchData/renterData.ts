import { db } from "../firebase/config"
import { collection, getDocs, orderBy, query, where, onSnapshot, doc, getDoc, Timestamp, updateDoc, addDoc } from "firebase/firestore"
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import fetchUserData from "../fetchData/fetchUserData";
dayjs.extend(relativeTime)

interface BoardDetails {
  boardId?: string;
  BC_BoarderUID?: string;
  BC_BoarderFullName?: string;
  BC_BoarderEmail?: string;
  BC_BoarderBoardedAt?: Timestamp | string | null;
  BC_BoarderCheckInTime?: Timestamp | string | null;
  BC_BoarderCheckOutTime?: Timestamp | string | null;
  BC_BoarderCheckInDate?: Timestamp | string | null;
  BC_BoarderCheckOutDate?: Timestamp | string | null;
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
  BC_BoarderUpdated?: Timestamp | string | null;
  BC_BoarderTypeRoom?: string;
  BC_RenterRoomID?: string;
  BC_RenterFullName?: string;
  BC_RenterUID?: string;
  BC_RenterRoomName?: string;
  BC_RenterPrice?: string;
  BC_RenterLocation?: string;
  BC_RenterEmail?: string;
}

interface Notification {
    id?: string;
    createdAt?: string;
    message?: string;
    doctor_UID?: string;
    notif_userUID?: string;
    status?: string;
    title?: string;
    type?: string;
  }

const myRooms = async (userID: string)=>{
    try{
        
        const roomsRef = collection(db, "board");
        const q = query(roomsRef, where("Renter_UserID", "==", userID), orderBy("Renter_UserID", "desc"));
        const roomSnap = await getDocs(q);

        const rooms = roomSnap.docs.map((doc)=>({
            id:doc.id,
            ...doc.data(),
        }));

        console.log(rooms);
        return rooms;

    }catch(error){
        console.error(error);
        return [];
    }
}

const myRoomsEmph = async (userID: string, roomStatus: string) =>{
   try{
    const id = userID;
    const status = roomStatus;

    const docRef = collection(db, "board")
    const q = query(docRef, where("Renter_UserID", "==", id), 
    where("Renter_RoomStatus", "==", status));

    const docSnap = await getDocs(q);

    const roomEmph = docSnap.docs.map((doc)=>({
        id:doc.id,
        ...doc.data(),
    }));
    
    
    return roomEmph;

   }catch(error){
    console.error(error);
    return [];
   }
}

const MyNotification = (userUID: string, callback: (notifications: Notification[]) => void) => {
    if (!userUID) {
      console.log("No doctor UID found.");
      return () => {}; 
    }
  
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("receiverID", "==", userUID));
  
    // Real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const myNotif: Notification[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data?.createdAt
            ? dayjs(data.createdAt.toDate()).fromNow() 
            : "Unknown time",
        };
      });
  
      callback(myNotif); // Send data to frontend
    });
  
    return unsubscribe; // Return the unsubscribe function for cleanup
  };

  const roomDetails = async(boardID:string): Promise<BoardDetails | null> => {
   try{
    const docRef = doc(db, "boarders", boardID);
    const docSnap = await getDoc(docRef);
 
    console.log("Doc Snap: ", docSnap);
  
    if(docSnap.exists()){
      return {boardId:docSnap.id, ...docSnap.data() as BoardDetails};

    }else{
      return null;
    }
   
  }catch(error){
    console.error(error);
    
    return null;
   }
  }

  
  const acceptedBooked = async(board_UID:string, totalPrice:number, senderID:string, receiverID:string, roomID: string) => {
    const userData = await fetchUserData();
    const displayName = userData[0]?.User_Name;
    try{
      const docRef = doc(db, "boarders", board_UID);
      const docSnap = await getDoc(docRef);
      console.log(roomID);
      


      if(docSnap.exists()){
         const fbNotifRef = collection(db, "notifications");
            await addDoc(fbNotifRef, {
                createdAt: Timestamp.now(),
                hide: false,
                open:false,
                message: `${displayName} accepted your booking`,
                room_ID: board_UID,
                receiverID: receiverID,
                senderID: senderID,
                status: "unread",
                title: `Accepted ${receiverID} booking`,
            });
          
          const boardRef = doc(db, "board", roomID);
          const boardUpdated = await updateDoc(boardRef,{
            Renter_RoomStatus: "reserved",
          })

          console.log(boardUpdated);
          

        const updated = updateDoc(docRef, {
          BC_BoarderStatus: "Reserved",
          BC_BoarderTotalPrice: totalPrice,
          BC_AcceptedAt: Timestamp.now(),
        })
        return updated;
      }
    }catch(error){
      console.error(error);
      return null;
      
    }
  }
  const checkedInRoom = async(board_UID:string, roomName: string, senderID:string, receiverID:string, roomID: string) => {

    try{
      const docRef = doc(db, "boarders", board_UID);
      const docSnap = await getDoc(docRef);
      console.log(roomID);
      
      const boardRef = doc(db, "board", roomID);
      const boardUpdated = await updateDoc(boardRef,{
        Renter_RoomStatus: "occupied",
      })

      if(docSnap.exists()){
         const fbNotifRef = collection(db, "notifications");
            await addDoc(fbNotifRef, {
                createdAt: Timestamp.now(),
                hide: false,
                open:false,
                message: `You have Checked-In in room ${roomName}`,
                room_ID: board_UID,
                receiverID: receiverID,
                senderID: senderID,
                status: "unread",
                title: `Checked-IN ${receiverID} booking`,
            });          
        const updated = updateDoc(docRef, {
          BC_BoarderStatus: "Occupied",
        })
        return {updated, boardUpdated};
      }
    }catch(error){
      console.error(error);
      return null;
      
    }
  }

  const paidBooking = async (board_UID:string, senderID:string, senderName: string, 
    receiverID:string, receiverName: string, roomName: string, roomID:string ) =>{
    try{
      const docRef = doc(db, "boarders", board_UID);
      const docSnap = await getDoc(docRef);

      if(docSnap.exists()){
        await addDoc(collection(db, "notifications"), {
          createdAt: Timestamp.now(),
          hide: false,
          room: roomName,
          message: `${senderName} received your payment, 
          please rate the room ${roomName}, and service of ${senderName} `,
          open: false,
          room_ID: board_UID,
          senderID: senderID,
          receiverID: receiverID,
          senderName: senderName,
          receiverName: receiverName,
          status: "unread",
          title: "Paid room", 
        });
        

        await updateDoc(doc(db, "board", roomID),{
          Renter_RoomStatus: "vacant",
        })
        
        const updated = await updateDoc(docRef,{
          BC_BoarderStatus: "Paid",
          BC_BoarderPaidAt: Timestamp.now(),
        });
        
        return updated;
      }
    }catch(error){
      console.log(error);
      
    }
  }

  const myEarnings = async (userID: string) =>{
    try{
      const docRef = collection(db, "boarders");
      const q = query(docRef, where("BC_RenterUID", "==", userID));
      const docSnap = await getDocs(q);

      const result = docSnap.docs.map((data)=>({
        BC_BoarderTotalPrice: data?.get("BC_BoarderTotalPrice"),
        BC_BoarderPaidAt: data?.get("BC_BoarderPaidAt")
      }));

    
      return result;
      
    }catch(error){
      console.error(error);
      return null
    }
  }

  const totalEarnings = async (userID: string) =>{
    try{
      const docRef = collection(db, "boarders");
      const q = query(docRef, where("BC_RenterUID", "==", userID));
      const docSnap = await getDocs(q);

      const result = docSnap.docs.map((data)=>({
        BC_BoarderTotalPrice: data?.get("BC_BoarderTotalPrice"),
      }));

    
      return result;
      
    }catch(error){
      console.error(error);
      return null
    }
  }

  const fetchMyDataBoarders = async(userUID: string) => {
    try{
      const docRef = collection(db, "boarders");
      const q = query(docRef, where("BC_RenterUID", "==", userUID || ""));
      const docSnap = await getDocs(q);

      const result = docSnap.docs.map((doc)=>({       
        id:doc.id,
        ...doc.data(),
      }))

      return result;

    } catch(error){
      console.error(error);
      return []
    }  
  }

  const ongoingRoom = async(userID:string) => {
    try{
      const docRef = collection(db, "boarders");
      const q = query(docRef, where("BC_RenterUID", "==", userID));
      const docSnap = await getDocs(q);

      let onGoing:number = 0;

      docSnap.docs.map((doc)=>{
        const data = doc.data()
        if(data.BC_BoarderStatus === "Occupied"){
          onGoing++;
        }
      })
      
      
      return onGoing;
    }
    catch(error){
      console.error(error);
      
    }
  }
  const completedRoom = async(userID:string) => {
    try{
      const docRef = collection(db, "boarders");
      const q = query(docRef, where("BC_RenterUID", "==", userID));
      const docSnap = await getDocs(q);

      let paid:number = 0;

      docSnap.docs.map((doc)=>{
        const data = doc.data()
        if(data.BC_BoarderStatus === "Paid"){
          paid++;
        }
      })
      
      
      return paid;
    }
    catch(error){
      console.error(error);
      
    }
  }
  const upcomingRoom = async(userID:string) => {
    try{
      const docRef = collection(db, "boarders");
      const q = query(docRef, where("BC_RenterUID", "==", userID));
      const docSnap = await getDocs(q);

      let reserved:number = 0;

      docSnap.docs.map((doc)=>{
        const data = doc.data()
        if(data.BC_BoarderStatus === "Reserved"){
          reserved++;
        }
      })
            
      return reserved;
    }
    catch(error){
      console.error(error);
      
    }
  }

export {myRooms,  fetchMyDataBoarders,  myRoomsEmph, MyNotification,
   roomDetails, acceptedBooked, paidBooking, myEarnings, 
   totalEarnings, checkedInRoom, ongoingRoom, upcomingRoom, completedRoom}