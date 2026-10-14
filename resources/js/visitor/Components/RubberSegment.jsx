import React, { useEffect, useMemo, useState } from 'react';

import './RubberSegment.css';

export default function RubberSegment({
    items = [],
    activeIndex = 0,
    defaultValue,
    onChange,
}) {
    /*
    |--------------------------------------------------------------------------
    | NORMALIZE ITEMS
    |--------------------------------------------------------------------------
    |
    | Komponen dapat menerima:
    |
    | 1. Array string
    |
    | [
    |     'Home',
    |     'About',
    |     'Experience'
    | | ]
    |
    | 2. Array object
    |
    | [
    |     {
    |         value: 'home',
    |         label: 'Home'
    |     }
    | ]
    |
    */

    const normalizedItems = useMemo(() => {
        return items.map((item, index) => {

            /*
            |--------------------------------------------------------------------------
            | STRING ITEM
            |--------------------------------------------------------------------------
            */

            if (typeof item === 'string') {
                return {
                    value: item,
                    label: item,
                    index,
                };
            }


            /*
            |--------------------------------------------------------------------------
            | OBJECT ITEM
            |--------------------------------------------------------------------------
            */

            if (item && typeof item === 'object') {
                return {
                    value:
                        item.value ??
                        item.label ??
                        index,

                    label:
                        item.label ??
                        item.value ??
                        `Item ${index + 1}`,

                    index,
                };
            }


            /*
            |--------------------------------------------------------------------------
            | FALLBACK
            |--------------------------------------------------------------------------
            */

            return {
                value: index,
                label: `Item ${index + 1}`,
                index,
            };
        });
    }, [items]);


    /*
    |--------------------------------------------------------------------------
    | INITIAL ACTIVE INDEX
    |--------------------------------------------------------------------------
    |
    | Jika defaultValue diberikan, cari item berdasarkan value.
    |
    | Contoh:
    |
    | defaultValue="Home"
    |
    | Maka Home akan menjadi menu aktif pertama kali.
    |
    */

    const getInitialIndex = () => {

        if (normalizedItems.length === 0) {
            return 0;
        }


        if (defaultValue !== undefined) {

            const foundIndex =
                normalizedItems.findIndex(
                    (item) =>
                        item.value === defaultValue
                );


            if (foundIndex !== -1) {
                return foundIndex;
            }
        }


        /*
        |--------------------------------------------------------------------------
        | FALLBACK KE ACTIVE INDEX
        |--------------------------------------------------------------------------
        */

        if (
            activeIndex >= 0 &&
            activeIndex < normalizedItems.length
        ) {
            return activeIndex;
        }


        return 0;
    };


    /*
    |--------------------------------------------------------------------------
    | ACTIVE STATE
    |--------------------------------------------------------------------------
    */

    const [active, setActive] = useState(
        getInitialIndex
    );


    /*
    |--------------------------------------------------------------------------
    | UPDATE ACTIVE INDEX
    |--------------------------------------------------------------------------
    |
    | Digunakan apabila parent component mengubah activeIndex.
    |
    */

    useEffect(() => {

        if (normalizedItems.length === 0) {
            setActive(0);
            return;
        }


        if (
            activeIndex >= 0 &&
            activeIndex < normalizedItems.length
        ) {
            setActive(activeIndex);
        }

    }, [
        activeIndex,
        normalizedItems.length,
    ]);


    /*
    |--------------------------------------------------------------------------
    | HANDLE CLICK
    |--------------------------------------------------------------------------
    */

    const handleClick = (index) => {

        /*
        |--------------------------------------------------------------------------
        | VALIDASI INDEX
        |--------------------------------------------------------------------------
        */

        if (
            index < 0 ||
            index >= normalizedItems.length
        ) {
            return;
        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE ACTIVE MENU
        |--------------------------------------------------------------------------
        */

        setActive(index);


        /*
        |--------------------------------------------------------------------------
        | SELECTED ITEM
        |--------------------------------------------------------------------------
        */

        const selectedItem =
            normalizedItems[index];


        /*
        |--------------------------------------------------------------------------
        | CALLBACK KE PARENT
        |--------------------------------------------------------------------------
        |
        | Contoh hasil:
        |
        | onChange('Experience', 2)
        |
        */

        if (onChange) {

            onChange(
                selectedItem.value,
                index
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | HANDLE KEYBOARD
    |--------------------------------------------------------------------------
    |
    | Memungkinkan navigasi menggunakan:
    |
    | Arrow Left
    | Arrow Right
    | Home
    | End
    |
    */

    const handleKeyDown = (
        event,
        index
    ) => {

        if (normalizedItems.length === 0) {
            return;
        }


        let nextIndex = index;


        /*
        |--------------------------------------------------------------------------
        | ARROW RIGHT
        |--------------------------------------------------------------------------
        */

        if (event.key === 'ArrowRight') {

            event.preventDefault();

            nextIndex =
                index + 1 >= normalizedItems.length
                    ? 0
                    : index + 1;
        }


        /*
        |--------------------------------------------------------------------------
        | ARROW LEFT
        |--------------------------------------------------------------------------
        */

        else if (event.key === 'ArrowLeft') {

            event.preventDefault();

            nextIndex =
                index - 1 < 0
                    ? normalizedItems.length - 1
                    : index - 1;
        }


        /*
        |--------------------------------------------------------------------------
        | HOME
        |--------------------------------------------------------------------------
        */

        else if (event.key === 'Home') {

            event.preventDefault();

            nextIndex = 0;
        }


        /*
        |--------------------------------------------------------------------------
        | END
        |--------------------------------------------------------------------------
        */

        else if (event.key === 'End') {

            event.preventDefault();

            nextIndex =
                normalizedItems.length - 1;
        }


        /*
        |--------------------------------------------------------------------------
        | ENTER / SPACE
        |--------------------------------------------------------------------------
        */

        else if (
            event.key === 'Enter' ||
            event.key === ' '
        ) {

            event.preventDefault();

            handleClick(index);

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | APPLY NAVIGATION
        |--------------------------------------------------------------------------
        */

        if (nextIndex !== index) {

            handleClick(nextIndex);


            /*
            |--------------------------------------------------------------------------
            | FOCUS ITEM BERIKUTNYA
            |--------------------------------------------------------------------------
            */

            requestAnimationFrame(() => {

                const buttons =
                    document.querySelectorAll(
                        '.rubber-segment-item'
                    );

                const nextButton =
                    buttons[nextIndex];

                if (nextButton) {
                    nextButton.focus();
                }
            });
        }
    };


    /*
    |--------------------------------------------------------------------------
    | EMPTY STATE
    |--------------------------------------------------------------------------
    */

    if (normalizedItems.length === 0) {
        return (
            <div
                className="rubber-segment"
                role="radiogroup"
                aria-label="Main navigation"
            />
        );
    }


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <div
            className="rubber-segment"
            role="radiogroup"
            aria-label="Main navigation"
        >

            {normalizedItems.map(
                (item, index) => (

                    <button
                        key={`${item.value}-${index}`}
                        type="button"

                        role="radio"

                        aria-checked={
                            active === index
                        }

                        aria-label={
                            item.label
                        }

                        tabIndex={
                            active === index
                                ? 0
                                : -1
                        }

                        className={`
                            rubber-segment-item
                            ${
                                active === index
                                    ? 'active'
                                    : ''
                            }
                        `}

                        onClick={() =>
                            handleClick(index)
                        }

                        onKeyDown={(event) =>
                            handleKeyDown(
                                event,
                                index
                            )
                        }
                    >
                        {item.label}
                    </button>
                )
            )}

        </div>
    );
}