<?php
 namespace MailPoetVendor\Doctrine\ORM\Query\AST; if (!defined('ABSPATH')) exit; class JoinClassPathExpression extends \MailPoetVendor\Doctrine\ORM\Query\AST\Node { public $abstractSchemaName; public $aliasIdentificationVariable; public function __construct($abstractSchemaName, $aliasIdentificationVar) { $this->abstractSchemaName = $abstractSchemaName; $this->aliasIdentificationVariable = $aliasIdentificationVar; } public function dispatch($walker) { return $walker->walkJoinPathExpression($this); } } 