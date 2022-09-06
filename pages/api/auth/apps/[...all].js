export default async function handler(req, res) {
  const { all } = req.query;
  console.log(req.query);
  console.log(all);

  if (all.length > 0) {
    try {
      const moduleA = await import(`../../../common/${all[0]}/api.js`);
      console.log(moduleA.default());
      moduleA.default(req, res);
    } catch (e) {
      console.log("error");
      console.log(e);
      res.status(404).send();
      return;
    }
  } else {
    res.status(404).json({ error: "app does not exist" });
  }
}
