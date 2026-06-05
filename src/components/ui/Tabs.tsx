import { cn } from "@/lib/utils"
import { useState, createContext, useContext, type ReactNode } from "react"

interface TabsContextType {
  activeTab: string
  setActiveTab: (id: string) => void
}

const TabsContext = createContext<TabsContextType>({ activeTab: "", setActiveTab: () => {} })

interface TabsProps {
  children: ReactNode
  defaultTab: string
  className?: string
  onChange?: (tab: string) => void
}

export function Tabs({ children, defaultTab, className, onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const handleChange = (tab: string) => {
    setActiveTab(tab)
    onChange?.(tab)
  }
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  children: ReactNode
  value: string
  className?: string
}

export function TabsTrigger({ children, value, className }: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useContext(TabsContext)
  const isActive = activeTab === value
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all duration-200",
        isActive && "bg-background text-foreground shadow-sm",
        className
      )}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  children: ReactNode
  value: string
  className?: string
}

export function TabsContent({ children, value, className }: TabsContentProps) {
  const { activeTab } = useContext(TabsContext)
  if (activeTab !== value) return null
  return <div className={cn("mt-4", className)}>{children}</div>
}
