<?php
/**
 * Copyright © 2015 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */

/**
 * App State class for integration tests framework
 */
namespace Magento\TestFramework\App;

class State extends \Magento\Framework\App\State
{
    /**
     * {@inheritdoc}
     */
    public function getAreaCode()
    {
        return $this->_areaCode;
    }

    /**
     * {@inheritdoc}
     */
    public function setAreaCode($code)
    {
        $this->_areaCode = $code;
        $this->_configScope->setCurrentScope($code);
    }
}
