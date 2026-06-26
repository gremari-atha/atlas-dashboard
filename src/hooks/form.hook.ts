import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { AccountModifierField } from "@/components/forms/common/fields/account-modifier-field";
import { BooleanCheckboxField } from "@/components/forms/common/fields/boolean-checkbox-field";
import { DatePickerField } from "@/components/forms/common/fields/date-picker-field";
import { EmailSelectField } from "@/components/forms/common/fields/email-select-field";
import { ProductVariantSelectField } from "@/components/forms/common/fields/product-variant-select-field";
import { SelecField } from "@/components/forms/common/fields/select-field";
import { TextField } from "@/components/forms/common/fields/text-field";
import { TextWithOptions } from "@/components/forms/common/fields/text-with-options-field";
import { TextareaField } from "@/components/forms/common/fields/textarea-field";
import { SubscribeButton } from "@/components/forms/common/form-components/subscribe-button";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    TextWithOptions,
    TextareaField,
    DatePickerField,
    BooleanCheckboxField,
    SelecField,
    EmailSelectField,
    ProductVariantSelectField,
    AccountModifierField,
  },
  formComponents: {
    SubscribeButton,
  },
});
