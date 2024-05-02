import type { ValidationChecks } from 'langium';
import type { ContextMapAstType } from './generated/ast.js';
import type { ContextMapServices } from './context-map-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: ContextMapServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ContextMapValidator;
    const checks: ValidationChecks<ContextMapAstType> = {
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class ContextMapValidator {
}
