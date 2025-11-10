import React from "react";
import Image from "next/image";

const ShippingMethod = () => {
  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Shipping Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="rounded-md border-[0.5px] py-3.5 px-5">
          <div className="flex items-center">
            <div className="pr-4">
              <Image
                src="/images/checkout/redx.png"
                alt="redx"
                width={64}
                height={18}
              />
            </div>

            <div className="border-l border-gray-4 pl-4">
              <p className="font-semibold text-dark">60 BDT</p>
              <p className="text-custom-xs">Standard Shipping</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingMethod;
