const menu = [
  {id:'ghee-podi-idli',name:'Ghee Podi Idli',category:'Tiffin',price:189,description:'Soft mini idlis tossed in house podi, ghee and curry leaves.',tag:'Guest favourite'},
  {id:'masala-dosa',name:'Annam Signature Masala Dosa',category:'Tiffin',price:229,description:'Golden fermented dosa, spiced potato masala and coconut chutneys.',tag:'Signature'},
  {id:'thatte-idli',name:'Thatte Idli',category:'Tiffin',price:169,description:'Karnataka-style, cloud-soft idli with sambar and chutney.'},
  {id:'medu-vada',name:'Medu Vada',category:'Tiffin',price:159,description:'Crisp golden lentil fritters, served with warm sambar.'},
  {id:'annam-thali',name:'Annam Grand Thali',category:'Meals',price:399,description:'A generous banana-leaf inspired spread of seasonal South Indian delicacies.',tag:'Chef curated'},
  {id:'mini-meals',name:'South Indian Mini Meals',category:'Meals',price:279,description:'Rice, sambar, rasam, poriyal, kootu, curd and pickle.'},
  {id:'bisibelebath',name:'Bisi Bele Bath',category:'Meals',price:249,description:'Slow-cooked rice and lentils with Karnataka spice blend.'},
  {id:'curd-rice',name:'Temple-Style Thayir Sadam',category:'Meals',price:179,description:'Comforting curd rice finished with a fragrant tempering.'},
  {id:'filter-kaapi',name:'Traditional Filter Kaapi',category:'Beverages',price:99,description:'Fresh decoction, frothy milk and a lingering coffee aroma.'},
  {id:'panakam',name:'Panakam',category:'Beverages',price:89,description:'A refreshing jaggery, dry ginger and cardamom cooler.'},
  {id:'payasam',name:'Ada Pradhaman',category:'Desserts',price:149,description:'Kerala-style payasam with jaggery, coconut milk and cashews.'},
  {id:'kesari',name:'Pineapple Kesari',category:'Desserts',price:129,description:'Silky semolina sweet with pineapple, saffron and ghee.'}
];

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.status(200).json(menu);
}
