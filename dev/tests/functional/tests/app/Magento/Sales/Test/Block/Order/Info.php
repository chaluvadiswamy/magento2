<?php
/**
 * Copyright © 2015 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */

namespace Magento\Sales\Test\Block\Order;

use Mtf\Block\Block;
use Mtf\Client\Element\Locator;

/**
 * Info block on order's view page.
 */
class Info extends Block
{
    /**
     * Address selector.
     *
     * @var string
     */
    protected $billingAddressSelector = '.box-order-billing-address address';

    /**
     * Payment method selector.
     *
     * @var string
     */
    protected $paymentMethodSelector = './/.[contains(., "%s")]/..[contains(@class, "payment-method")]';

    /**
     * Check if payment method is visible in print order page.
     *
     * @param string $paymentMethod
     * @return bool
     */
    public function isPaymentMethodVisible($paymentMethod)
    {
        return $this->_rootElement->find(
            sprintf($this->paymentMethodSelector, $paymentMethod),
            Locator::SELECTOR_XPATH
        )->isVisible();
    }

    /**
     * Returns billing address.
     *
     * @return string
     */
    public function getBillingAddress()
    {
        return $this->_rootElement->find($this->billingAddressSelector)->getText();
    }
}
