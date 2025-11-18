const express = require("express");
const app = express();
const port = 4000;
const path = require('path');

app.use(express.static("public"));
app.use(express.json());

const widgetSecretKey = process.env.WIDGET_SECRET_KEY || "test_gck_26DlbXAaV07zqlkZXak13qY50Q9R";

const encryptedWidgetSecretKey = "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

app.get("/api/health/", (req, res) => {
 res.status(200).send("OK");
});

app.use("/payment", express.static("public/widget"));

app.get("/widget/success.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public/widget/success.html"));
});

app.get("/fail.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public/fail.html"));
});

app.post("/confirm/widget", function (req, res) {
 const { paymentKey, orderId, amount } = req.body;

 fetch("https://api.tosspayments.com/v1/payments/confirm", {
  method: "POST",
  headers: {
   Authorization: encryptedWidgetSecretKey,
   "Content-Type": "application/json",
  },
  body: JSON.stringify({
   orderId: orderId,
   amount: amount,
   paymentKey: paymentKey,
  }),
 }).then(async function (response) {
  const result = await response.json();
    
  if (!response.ok) {
    res.redirect(
            `/fail.html?code=${result.code}&message=${encodeURIComponent(result.message)}&orderId=${orderId}`
        );
    return;
  }

  res.redirect(
        `/widget/success.html?paymentKey=${paymentKey}&orderId=${orderId}&amount=${amount}`
    );
 });
});

app.listen(port, () => console.log(`http://localhost:${port} 으로 샘플 앱이 실행되었습니다.`));