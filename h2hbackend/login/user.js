const { supabase } = require("../supabase");

// If request has user, send to next point. If not, return 401 (unauthorized)
function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

async function findOrCreateUser(user) {
  // console.log(user);
  const { data, error } = await supabase
    .from("Users")
    .select()
    .eq("wcaid", user.wca.id);

  if (data.length === 0) {
    // console.log("No user found");
    const { error } = await supabase.from("Users").insert({
      name: user.displayName,
      wcaid: user.wca.id,
      profile_pic_url: user.photos[0].value,
    });

    console.error(error);
  }
  return data;
}

module.exports = { findOrCreateUser, isLoggedIn };
