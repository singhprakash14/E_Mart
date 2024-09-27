import React, { useContext, useEffect, useState } from "react";
import apiCalls from "../helpers/apiCalls";
import displayINRCurrency from "../helpers/displayCurrency";
import { MdDelete } from "react-icons/md";
import Context from "../context/context";
import { loadStripe } from "@stripe/stripe-js";

const Cart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [contactNumber, setContactNumber] = useState("");
  const cartSkeleton = new Array(4).fill(null);

  const context = useContext(Context);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });
  };

  const handleContactNumberChange = (e) => {
    setContactNumber(e.target.value);
  };

  const fetchCartData = async () => {
    const responseData = await fetch(apiCalls.viewCartProducts.url, {
      method: apiCalls.viewCartProducts.method,
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
    });

    const actualData = await responseData.json();

    if (actualData.success) {
      setData(actualData.data);
    }
  };

  const handleLoading = async () => {
    await fetchCartData();
  };

  const increaseProductQuantity = async (id, qty) => {
    const responseData = await fetch(apiCalls.updateCartProduct.url, {
      method: apiCalls.updateCartProduct.method,
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        _id: id,
        quantity: qty + 1,
      }),
    });

    const actualData = await responseData.json();

    if (actualData.success) {
      fetchCartData();
    }
  };

  const decreaseProductQuantity = async (id, qty) => {
    if (qty >= 2) {
      const responseData = await fetch(apiCalls.updateCartProduct.url, {
        method: apiCalls.updateCartProduct.method,
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          _id: id,
          quantity: qty - 1,
        }),
      });

      const actualData = await responseData.json();

      if (actualData.success) {
        fetchCartData();
      }
    }
  };

  const deleteCartProduct = async (id) => {
    const responseData = await fetch(apiCalls.deleteCartProduct.url, {
      method: apiCalls.deleteCartProduct.method,
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        _id: id,
      }),
    });

    const actualData = await responseData.json();

    if (actualData.success) {
      fetchCartData();
      context.fetchCartProductsCount();
    }
  };

  const totalQty = data.reduce((prev, curr) => prev + curr.quantity, 0);

  const totalPrice = data.reduce(
    (prev, curr) => prev + curr.quantity * curr?.productId?.sellingPrice,
    0
  );

  const handlePayment = async () => {
    const { street, city, state, postalCode, country } = address;
    if (!street || !city || !state || !postalCode || !country || !contactNumber) {
      alert("Please fill in all the shipping details before proceeding to payment.");
      return;
    }

    const stripePromise = await loadStripe(
      process.env.REACT_APP_STRIPE_PUBLIC_KEY
    );

    const responseData = await fetch(apiCalls.payment.url, {
      method: apiCalls.payment.method,
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        cartItems: data,
      }),
    });

    const actualData = await responseData.json();

    if (actualData?.id) {
      stripePromise.redirectToCheckout({ sessionId: actualData.id });
    }
  };

  useEffect(() => {
    setLoading(true);
    handleLoading();
    setLoading(false);
  }, []);

  return (
    <div className="container mx-auto">
      {data.length === 0 && !loading && (
        <div className="w-full py-6">
          <p className="bg-white text-center text-lg py-5">No Data</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-10 lg:justify-between p-3 py-2 lg:px-8">
        {/* View Cart Products */}
        <div className="w-full max-w-3xl">
          {loading
            ? cartSkeleton.map((_, index) => (
                <div
                  key={`CartProductCard-${index}`}
                  className="w-full bg-slate-200 h-32 border my-2 border-slate-300 animate-pulse rounded"
                ></div>
              ))
            : data.map((product, index) => (
                <div
                  key={product?._id + "CartPage"}
                  className="w-full bg-white h-32 my-2 border border-slate-300 rounded grid grid-cols-[128px,1fr]"
                >
                  <div className="w-32 h-32 bg-slate-200 p-1">
                    <img
                      src={product?.productId?.productImage[0]}
                      alt="ProductImage"
                      className="w-full h-full object-scale-down mix-blend-multiply"
                    />
                  </div>

                  <div className="px-4 py-2 relative">
                    <div
                      className="absolute right-0 text-red-600 rounded-full p-2 hover:bg-red-600 hover:text-white cursor-pointer"
                      onClick={() => deleteCartProduct(product?._id)}
                    >
                      <MdDelete />
                    </div>
                    <h2 className="text-base md:text-lg lg:text-xl text-ellipsis line-clamp-1">
                      {product?.productId?.productName?.replace(/boAt/gi, "").trim()}
                    </h2>
                    <p className="capitalize text-slate-500">
                      {product?.productId.category}
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-red-600 font-medium text-base md:text-lg">
                        {displayINRCurrency(product?.productId?.sellingPrice)}
                      </p>
                      <p className="text-slate-600 font-semibold text-base md:text-lg">
                        {displayINRCurrency(
                          product?.productId?.sellingPrice * product?.quantity
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <button
                        className={`border border-red-600 font-medium text-red-600 hover:bg-red-600 hover:text-white w-6 h-6 flex justify-center items-center rounded ${
                          product.quantity === 1 ? "cursor-not-allowed" : "cursor-pointer"
                        }`}
                        onClick={() => decreaseProductQuantity(product?._id, product?.quantity)}
                      >
                        -
                      </button>
                      <span>{product?.quantity}</span>
                      <button
                        className="border border-red-600 font-medium text-red-600 hover:bg-red-600 hover:text-white w-6 h-6 flex justify-center items-center rounded cursor-pointer"
                        onClick={() => increaseProductQuantity(product?._id, product?.quantity)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Cart Order Summary */}
        {data[0] && (
          <div className="w-full max-w-sm">
            {loading ? (
              <div className="w-full h-36 bg-slate-200 border border-slate-300 animate-pulse"></div>
            ) : (
              <div className="flex flex-col gap-4">
                <h2 className="text-white bg-red-600 text-center font-medium text-lg py-2 rounded-lg">
                  Order Summary
                </h2>

                <div className="flex items-center justify-between text-lg font-medium text-gray-700">
                  <p>Total Quantity</p>
                  <p>{totalQty}</p>
                </div>

                <div className="flex items-center justify-between text-lg font-medium text-gray-700">
                  <p>Total Price</p>
                  <p>{displayINRCurrency(totalPrice)}</p>
                </div>

                <div className="checkout-form flex flex-col gap-3">
                  <h3 className="font-semibold text-lg mb-2">Shipping Address</h3>

                  <div className="grid grid-cols-1 gap-4">
                    <input
                      type="text"
                      name="street"
                      value={address.street}
                      onChange={handleInputChange}
                      placeholder="Street Address"
                      className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                    />

                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                    />

                    <input
                      type="text"
                      name="state"
                      value={address.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                    />

                    <input
                      type="text"
                      name="postalCode"
                      value={address.postalCode}
                      onChange={handleInputChange}
                      placeholder="Postal Code"
                      className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                    />

                    <input
                      type="text"
                      name="country"
                      value={address.country}
                      onChange={handleInputChange}
                      placeholder="Country"
                      className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                    />

                    <input
                      type="text"
                      value={contactNumber}
                      onChange={handleContactNumberChange}
                      placeholder="Contact Number"
                      className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:ring-blue-200"
                    />
                  </div>

                  <button
                    className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg"
                    onClick={handlePayment}
                  >
                    Proceed to Pay
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
