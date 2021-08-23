<?php
 namespace MailPoetVendor\Symfony\Component\Validator\Constraints; if (!defined('ABSPATH')) exit; use MailPoetVendor\Symfony\Component\Validator\Constraint; use MailPoetVendor\Symfony\Component\Validator\ConstraintValidator; use MailPoetVendor\Symfony\Component\Validator\Exception\UnexpectedTypeException; use MailPoetVendor\Symfony\Component\Validator\Exception\UnexpectedValueException; class UniqueValidator extends \MailPoetVendor\Symfony\Component\Validator\ConstraintValidator { public function validate($value, \MailPoetVendor\Symfony\Component\Validator\Constraint $constraint) { if (!$constraint instanceof \MailPoetVendor\Symfony\Component\Validator\Constraints\Unique) { throw new \MailPoetVendor\Symfony\Component\Validator\Exception\UnexpectedTypeException($constraint, \MailPoetVendor\Symfony\Component\Validator\Constraints\Unique::class); } if (null === $value) { return; } if (!\is_array($value) && !$value instanceof \IteratorAggregate) { throw new \MailPoetVendor\Symfony\Component\Validator\Exception\UnexpectedValueException($value, 'array|IteratorAggregate'); } $collectionElements = []; foreach ($value as $element) { if (\in_array($element, $collectionElements, \true)) { $this->context->buildViolation($constraint->message)->setParameter('{{ value }}', $this->formatValue($value))->setCode(\MailPoetVendor\Symfony\Component\Validator\Constraints\Unique::IS_NOT_UNIQUE)->addViolation(); return; } $collectionElements[] = $element; } } } 