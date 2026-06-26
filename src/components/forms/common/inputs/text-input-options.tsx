import { Trash2 } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { ErrorDisplay } from "../error-display";

interface TextInputOptionsProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  itemStorageName: string;
  onChange: (value: string) => void;
  errors?: any;
}

export function TextInputOptions({
  id,
  itemStorageName,
  label,
  value,
  onChange,
  placeholder,
  errors,
  ...attributes
}: TextInputOptionsProps) {
  const [open, setOpen] = useState(false);
  const itemList = useRef<Array<string>>([]);
  const [filteredList, setFilteredList] = useState<Array<string>>(() => {
    const data = localStorage.getItem(itemStorageName);
    const parsed = data ? JSON.parse(data) : [];
    itemList.current = parsed;
    return parsed;
  });

  const handleValueChange = (v: string) => {
    if (!v) {
      setFilteredList(itemList.current);
    } else {
      const filterData = itemList.current.filter((item) => item.includes(v));
      if (filterData.length) {
        setFilteredList(filterData);
      } else {
        setOpen(false);
      }
    }
    onChange(v);
  };

  const onInputFocus = () => {
    if (filteredList.length) {
      setOpen(true);
    }
  };

  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v && !itemList.current.includes(v)) {
      const updatedList = [...itemList.current, v];
      itemList.current = updatedList;
      setFilteredList(updatedList);
      localStorage.setItem(itemStorageName, JSON.stringify(updatedList));
    }
    setOpen(false);
  };

  const onSelectItem = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onDeleteItem = (v: string) => {
    const filteredData = itemList.current.filter((item) => item !== v);
    itemList.current = filteredData;
    setFilteredList(filteredData);
    localStorage.setItem(itemStorageName, JSON.stringify(filteredData));
  };

  return (
    <div className="grid gap-3">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <Input
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            {...attributes}
          />
        </PopoverAnchor>
        <PopoverContent
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          onInteractOutside={(e) => {
            if (e.target instanceof Element && e.target.id === id) {
              e.preventDefault();
            }
          }}
          className="PopoverContent flex flex-col gap-2 px-0"
        >
          {filteredList.map((item, ix) => (
            <div key={`${id}-item-${ix}`} className="flex">
              <Button
                type="button"
                variant="ghost"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onSelectItem(item);
                }}
                className="flex-1 justify-start cursor-pointer"
              >
                {item}
              </Button>
              <Button
                variant="ghost"
                onPointerDown={(e) => {
                  e.preventDefault();
                  onDeleteItem(item);
                }}
                className="text-destructive cursor-pointer"
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </PopoverContent>
      </Popover>
      <ErrorDisplay errors={errors} />
    </div>
  );
}
