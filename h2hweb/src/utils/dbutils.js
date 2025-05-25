import supabase from "../supabase";
import axios from "axios";

async function getProfilePicture(userId) {
  const { data, error } = await supabase
    .from("Users")
    .select("profile_pic_url")
    .eq("id", userId)
    .single();

  if (error) return -1;
  else return data;
}

async function getNameFromId(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .single();

  if (error) {
    console.error(error);
    return -1;
  } else return data.name;
}

const getUserInfo = async (userId) => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/user/userPublic`,
      {
        params: {
          id: Number.parseInt(userId, 10),
        },
      }
    );
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export { getProfilePicture, getNameFromId, getUserInfo };
