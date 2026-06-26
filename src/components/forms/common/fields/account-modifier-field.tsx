import {
  NETFLIX_RESET_PASSWORD,
  SUBS_END_DISABLE_ACCOUNT,
  SUBSCRIPTION_EXPIRY_NOTIFIER,
} from "@/constants/modifier.consf";
import { useFieldContext } from "@/hooks/form.hook";
import { NetflixResetPasswordModifier } from "../form-components/netflix-reset-password-modifier";
import { SubsEndDisableAccountModifier } from "../form-components/subs-end-disable-account-modifier";
import { SubscriptionExpiryNotifierModifier } from "../form-components/subscription-expiry-notifier";
import type { ModifierObject } from "../types/modifier.type";

function getDefaultValue(modifierId: string, modifiers: Array<ModifierObject>) {
  const mod = modifiers.find((m) => m.modifier_id === modifierId);
  const metadataObj = mod
    ? mod.metadata.reduce<Record<string, string>>((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {})
    : undefined;
  return {
    checked: !!mod,
    ...metadataObj,
  };
}

export function AccountModifierField() {
  const field = useFieldContext<Array<ModifierObject>>();
  const accountModifier: Array<ModifierObject> = field.state.value?.length
    ? field.state.value
    : [];
  const defaultValue = {
    NETFLIX_RESET_PASSWORD: getDefaultValue(
      NETFLIX_RESET_PASSWORD,
      accountModifier,
    ),
    SUBS_END_DISABLE_ACCOUNT: getDefaultValue(
      SUBS_END_DISABLE_ACCOUNT,
      accountModifier,
    ),
    SUBSCRIPTION_EXPIRY_NOTIFIER: getDefaultValue(
      SUBSCRIPTION_EXPIRY_NOTIFIER,
      accountModifier,
    ),
  };
  const handleChange = (id: string, value: ModifierObject | null) => {
    const index = accountModifier.findIndex((item) => item.modifier_id === id);

    if (index !== -1) {
      if (value) {
        // replace
        accountModifier[index] = value;
      } else {
        // delete
        accountModifier.splice(index, 1);
      }
    } else {
      if (value) {
        // insert
        accountModifier.push(value);
      }
    }
    field.handleChange(accountModifier);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-border rounded-lg p-4 bg-card/30">
        <NetflixResetPasswordModifier
          defaultValue={defaultValue.NETFLIX_RESET_PASSWORD}
          onChange={handleChange}
        />
      </div>
      <div className="border border-border rounded-lg p-4 bg-card/30">
        <SubscriptionExpiryNotifierModifier
          defaultValue={defaultValue.SUBSCRIPTION_EXPIRY_NOTIFIER}
          onChange={handleChange}
        />
      </div>
      <div className="border border-border rounded-lg p-4 bg-card/30">
        <SubsEndDisableAccountModifier
          defaultValue={defaultValue.SUBS_END_DISABLE_ACCOUNT}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
