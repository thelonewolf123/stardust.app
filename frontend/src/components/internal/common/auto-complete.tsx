'use client'

import * as React from 'react'
import { FaSpinner } from 'react-icons/fa'
import { RxCaretSort, RxCheck } from 'react-icons/rx'

import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export function Autocomplete({
    value: defaultValue,
    options,
    placeholder,
    disabled,
    onChange
}: {
    options: { value: string; label: string }[]
    placeholder?: string
    onChange?: (value: string) => void
    disabled?: boolean
    value?: string
}) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(defaultValue)

    return (
        <Popover
            open={open}
            onOpenChange={(x) => {
                if (disabled) return
                setOpen(x)
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between"
                >
                    {value
                        ? options.find((item) => item.value === value)?.label
                        : `Select ${placeholder || 'item'}...`}
                    <RxCaretSort className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
                <Command aria-disabled={disabled} className="w-full">
                    <CommandInput
                        placeholder={`Search ${placeholder || 'item'}...`}
                        className="h-9"
                    />
                    <CommandEmpty className="flex items-center gap-2">
                        <FaSpinner className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                    </CommandEmpty>
                    <CommandGroup>
                        <CommandList>
                            {options.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.value}
                                    onSelect={(currentValue) => {
                                        setValue(
                                            currentValue === value
                                                ? ''
                                                : currentValue
                                        )
                                        setOpen(false)
                                        onChange?.(currentValue)
                                    }}
                                >
                                    {item.label}
                                    <RxCheck
                                        className={cn(
                                            'ml-auto h-4 w-4',
                                            value === item.value
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandList>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
