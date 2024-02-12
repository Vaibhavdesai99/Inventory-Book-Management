namespace Bookshop;
using from '../db/schema';
 
service Seller{
    entity SellerRegister as projection on Bookshop.Sellers;
    entity SellerLogin as projection on Bookshop.Sellers;
    entity SellerToken{
        token:String;
    }
    entity sellers as projection on Bookshop.Sellers;
}
 
service Buyer{
    entity BuyerRegister as projection on Bookshop.Buyers;
    entity BuyerLogin as projection on Bookshop.Buyers;
    entity BuyerToken{
        token:String;
    }
    entity buyers as projection on Bookshop.Buyers;
}
 
service book {
entity getbooks as projection on Bookshop.Books;
entity postbooks as projection on Bookshop.Books;
}
 
service addtocart  {
 entity addtocart as projection on Bookshop.Cart
   entity proceed as projection on Bookshop.Cart;
   entity deletecart as projection on Bookshop.Cart;
 
}