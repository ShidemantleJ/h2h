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
  const { data, error } = await supabase
    .from("users")
    .select("id, name, wcaid, profile_id, created_at, profile_pic_url")
    .eq("id", userId)
    .maybeSingle();
  if (error) console.error(error);
  return data;
};

export { getProfilePicture, getNameFromId, getUserInfo };
