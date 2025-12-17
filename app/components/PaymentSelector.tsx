'use client';

import React from 'react';
import MonriPayButton from './MonriPayCheckout';

interface PaymentSelectorProps {
    amount: number;
}

const PaymentSelector: React.FC<PaymentSelectorProps> = ({ amount }) => {
    return (
        <div className="w-full">
            {/* MonriPay Payment Section */}
            <div className="mb-4">
                {/* <h3 className="text-lg font-semibold mb-3 text-gray-700">Plaćanje putem MonriPay-a</h3> */}

                {/* MonriPay Info Card */}
                {/* <div className="border rounded-lg p-4 bg-blue-50 border-blue-200 mb-4"> */}
                    {/* <div className="flex items-center space-x-3 mb-3"> */}
                        {/* <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                        </div> */}
                        {/* <div>
                            <div className="font-medium text-gray-800">MonriPay</div>
                            <div className="text-sm text-gray-600">Regionalni leader za Crnu Goru</div>
                        </div> */}
                    {/* </div> */}

                    {/* Features */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                            <span className="text-green-500 mr-2">✓</span>
                            Idealno za Crnu Goru
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <span className="text-green-500 mr-2">✓</span>
                            Lokalne banke podrška
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <span className="text-green-500 mr-2">✓</span>
                            EUR valuta
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <span className="text-green-500 mr-2">✓</span>
                            Bezbednost PCI DSS
                        </div>
                    </div> */}

                    {/* Test Mode Notice */}
                    {/* <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <div className="flex items-center space-x-2">
                          <span className="text-yellow-600">🧪</span>
                          <div className="text-sm">
                              <div className="font-medium text-yellow-800">Test simulacija</div>
                              <div className="text-yellow-700">
                                  Trenutno je aktivna simulacija plaćanja. Za produkciju potrebna je registracija na monri.com
                              </div>
                          </div>
                      </div>
                  </div> */}
                {/* </div> */}
            </div>

            {/* Payment Button */}
            <div className="mb-4">
                <MonriPayButton amount={amount} />
            </div>

            {/* Additional Info
          <div className="text-xs text-gray-500 text-center">
              <p>Plaćanje je zaštićeno MonriPay sigurnosnim protokolima</p>
              <p>Podržane su sve glavne banke u Crnoj Gori</p>
      </div> */}
        </div>
    );
};

export default PaymentSelector;
