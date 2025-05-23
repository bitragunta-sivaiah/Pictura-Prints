 <div className="mb-4">
                                <h3 className="text-lg font-semibold mb-2 text-gray-800">Returned Items:</h3>
                                {returnDetails.items?.length > 0 ? (
                                     <ul className="divide-y divide-gray-200">
                        {returnDetails.items &&
                            returnDetails.items.map((item) => {
                                const colorMatch = item.product?.availableColors?.find(
                                    (colorObj) => colorObj.color === item.color
                                );
                                const imageUrl = colorMatch?.images?.front;

                                return (
                                    <li key={item._id} className="px-4 py-4 sm:px-6 flex items-center">
                                        <div className="w-24 h-24 rounded-md overflow-hidden shadow-sm mr-4">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                    <InfoIcon className="w-8 h-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-800">{item.product?.name}</p>
                                            <div className="flex items-center text-sm text-gray-600">
                                                Color:
                                                <span
                                                    className="inline-block w-5 h-5 rounded-full ml-1 shadow-sm"
                                                    style={{ backgroundColor: item.color }}
                                                ></span>
                                                <span className="ml-2 font-medium">{item.color}</span>,
                                                <span className="ml-4">Size: <span className="font-medium">{item.size}</span></span>
                                            </div>
                                            {item.customizations && item.customizations.length > 0 && (
                                                <div className="mt-1">
                                                    <p className="text-xs text-gray-500">Customizations:</p>
                                                    <ul className="list-disc pl-4">
                                                        {item.customizations.map((customizationId) => (
                                                            <li key={customizationId} className="text-xs text-gray-500">
                                                                Customization ID: {customizationId} {/* Replace with actual data if available */}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-700 font-medium">${item.finalPrice.toFixed(2)}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </li>
                                );
                            })}
                    </ul>
                                ) : (
                                    <p className="text-gray-700">No items requested for return.</p>
                                )}
                            </div>