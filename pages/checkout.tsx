import { useEffect, useState } from "react";
import { AiFillGoogleCircle, AiFillMail } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToasts } from "react-toast-notifications";
import { useRouter } from "next/router";
import axios from "axios";
import { BsDiscord } from "react-icons/bs";


const TextInput = ({ placeholder }) => {
  return (
    <input
      type="text" placeholder={placeholder}
      className="w-full my-1 p-2 border border-r-2"
    />
  )
}

const TextLabel = ({ content }) => {
  return (
    <label className="w-full mt-1 block">{content}</label>
  )
}

export default function () {
  const { addToast } = useToasts();
  return (
    <div className="flex justify-center items-center md:p-10 p-2">
      <div className="flex flex-col md:flex-row text-black">
        <div className="w-full md:w-9/12">
          <div className="bg-gray-100 p-3 md:p-10 rounded">
            <form onSubmit={() => { }}>
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 md:p-4">
                  <h3>Billing Address</h3>
                  <TextLabel content={"Full Name"} />
                  <TextInput placeholder={"John M. Doe"} />
                  <TextLabel content={"Email"} />
                  <TextInput placeholder={"john@example.com"} />
                  <TextLabel content={"Address"} />
                  <TextInput placeholder={"542 W. 15th Street"} />
                  <TextLabel content={"City"} />
                  <TextInput placeholder={"New York"} />
                  <div className="flex">
                    <div className="w-1/2">
                      <TextLabel content={"State"} />
                      <TextInput placeholder={"NY"} />
                    </div>
                    <div className="w-1/2">
                      <TextLabel content={"Zip Code"} />
                      <TextInput placeholder={"10001"} />
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-1/2 md:p-4">
                  <h3>Payment</h3>
                  <label >Accepted Cards</label>
                  <div className="flex space-x-2 mb-3 p-3">
                    <img src="/logo/visa.jpg" alt="Visa" width={50} />
                    <img src="/logo/master.jpg" alt="Master" width={50} />
                    <img src="/logo/discover.jpg" alt="Master" width={50} />
                    {/* <img src="/logo/ae.jpg" alt="American Express" width={50} /> */}
                  </div>
                  <TextLabel content={"Name on Card"} />
                  <TextInput placeholder={"John More Doe"} />
                  <TextLabel content={"Credit card number"} />
                  <TextInput placeholder={"1111-2222-3333-4444"} />
                  <TextLabel content={"Exp Month"} />
                  <TextInput placeholder={"September"} />

                  <div className="flex">
                    <div className="w-1/2">
                      <TextLabel content={"Exp Year"} />
                      <TextInput placeholder={"2018"} />
                    </div>
                    <div className="w-1/2">
                      <TextLabel content={"CVV"} />
                      <TextInput placeholder={"352"} />
                    </div>
                  </div>
                </div>

              </div>
            </form>
            <button className="btn"
              onClick={() => {
                console.log('clicked')
                addToast('We are waiting for payment bank approval', { appearance: 'info', autoDismiss: true })
              }}>Continue to checkout</button>
          </div>
        </div>

        <div className="w-full md:w-1/4 mt-3 md:ml-5">
          <div className="bg-gray-100 p-3 md:p-10 rounded">
            <h4>Cart
              <span className="price" style={{ color: "black" }}>
                <i className="fa fa-shopping-cart"></i>
                <b>4</b>
              </span>
            </h4>
            <p><a href="#">Product 1</a> <span className="price">$15</span></p>
            <p><a href="#">Product 2</a> <span className="price">$5</span></p>
            <p><a href="#">Product 3</a> <span className="price">$8</span></p>
            <p><a href="#">Product 4</a> <span className="price">$2</span></p>
            <hr />
            <p>Total <span className="price" style={{ color: "black" }}><b>$30</b></span></p>
          </div>
        </div>
      </div>
    </div>
  );
};




