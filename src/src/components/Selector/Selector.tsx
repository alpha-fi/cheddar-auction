import React, { useEffect, useMemo, useState } from "react";
import snake from "to-snake-case";
import {
  tenk_MethodName,
  auction_MethodName,
  tenk_changeMethods,
  auction_changeMethods,
  tenk_viewMethods,
  auction_viewMethods,
} from "../../near/methods";
import { Dropdown } from ".."
import useNear from '../../hooks/useTenkNear'

type Item = {
  children: string
  onSelect: () => void
}

type Items = {
  'Change Methods'?: Item[]
  'View Methods': Item[]
}

export const SelectorTenk: React.FC<{
  value?: string,
  onSelected: (method: tenk_MethodName) => void
}> = ({ value, onSelected }) => {
  const { wallet } = useNear()

  const toItem = useMemo(() => (method: tenk_MethodName) => ({
    children: snake(method),
    onSelect: () => {
      onSelected(method);
    },
  }), [onSelected])

  const tenk_items: Items = useMemo(() => {
    const user = wallet?.getAccountId() as string

    const ret: Items = { 'View Methods': tenk_viewMethods.map(toItem) }
    if (user) ret['Change Methods'] = tenk_changeMethods.map(toItem)

    return ret
  }, [wallet, toItem])

  return (
    <Dropdown
      trigger={value ?? "Select contract method"}
      items={
        
        Object.keys(tenk_items).length === 1
        ? tenk_items['View Methods']
        : tenk_items
      }
    />
  )
}

export const SelectorAuction: React.FC<{
  value?: string,
  onSelected: (method: auction_MethodName) => void
}> = ({ value, onSelected }) => {
  const { wallet } = useNear()

  const toItem = useMemo(() => (method: auction_MethodName) => ({
    children: snake(method),
    onSelect: () => {
      onSelected(method);
    },
  }), [onSelected])

  const auction_items: Items = useMemo(() => {
    const user = wallet?.getAccountId() as string

    const ret: Items = { 'View Methods': auction_viewMethods.map(toItem) }
    if (user) ret['Change Methods'] = auction_changeMethods.map(toItem)

    return ret
  }, [wallet, toItem])

  return (
    <Dropdown
      trigger={value ?? "Select contract method"}
      items={
        
        Object.keys(auction_items).length === 1
        ? auction_items['View Methods']
        : auction_items
      }
    />
  )
}