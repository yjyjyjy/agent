
import axios from 'axios';
import React, { Dispatch, SetStateAction, useState } from 'react';

function CardRow({ products, activeCard, setActiveCard }: { products: any, activeCard: number, setActiveCard: Dispatch<SetStateAction<number>> }) {


  const handleClick = (index) => {
    setActiveCard(index);
  };
  let cardData = [];
  if (Array.isArray(products)) {
    cardData = products.map((product, index) => {
      return {
        title: product.name,
        subtitle: product.description
      }
    });
  } else {
    console.error('products is not an array');
  }
  // const cardData = [
  //     { title: '$10', subtitle: '1,000 Token' },
  //     { title: '$30', subtitle: '3,000 Token' },
  //     { title: '$60', subtitle: '6,000 Token' },
  // ];

  return (
    <>

      <div className="flex flex-col w-full border-opacity-50">

        <div className="divider ">One Time Payment</div>
        <div className="flex flex-row justify-around">
          {cardData.map((card, index) => (
            <div
              key={index}
              onClick={() => handleClick(index)}
              className={`card flex w-24  ${activeCard === index ? 'bg-base-200 ' : 'bg-transparent text-transparent-content'}`}
            >
              <div className="card-body flex flex-col justify-center items-center">
                <h2 className="card-title text-primary">{card.title}</h2>
                <p>{card.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>


    </>
  );
}

export default CardRow;