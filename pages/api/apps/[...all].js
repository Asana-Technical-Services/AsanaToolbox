export default async function handler(req, res) {
  const { all } = req.query;

  if (all.length > 0) {
    try {
      const moduleA = await import(`../../../common/${all[0]}/api.js`);
      moduleA.default(req, res);
    } catch (e) {
      res.status(404).send();
      return;
    }
  } else {
    res.status(404).json({ error: "app does not exist" });
  }
}
