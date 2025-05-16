import supabase from "../supabase";

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

export { getProfilePicture, getNameFromId };
