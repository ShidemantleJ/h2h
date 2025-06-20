import { supabase } from "../db/supabase.js";

// If request has user, send to next point. If not, return 401 (unauthorized)
function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

async function findOrCreateUser(user) {
  // console.log(user.id);
  if (!user.wca.id) return null;
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("profile_id", user.id)
    .single();

  console.error(error);

  if (!data) {
    // console.log("No user found");
    const { error } = await supabase.from("users").insert({
      name: user.displayName,
      profile_id: user.id,
      wcaid: user?.wca.id,
      profile_pic_url: user.photos[0].value,
    });

    console.error(error);
  }
  return data;
}

export { findOrCreateUser, isLoggedIn };
