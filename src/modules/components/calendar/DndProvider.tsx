/**
 * Drag and Drop Provider Context
 * Adapted from Next.js to work with Vite/React
 * 
 * Handles drag and drop functionality for calendar events
 */

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import type { IEvent } from '../../calendar/interfaces';

interface IDragData {
  event: IEvent;
  sourceDate: Date;
  sourceTime?: string;
}

interface IDndContext {
  // Drag state
  isDragging: boolean;
  dragData: IDragData | null;
  
  // Drag operations
  startDrag: (event: IEvent, sourceDate: Date, sourceTime?: string) => void;
  endDrag: () => void;
  
  // Drop operations
  handleDrop: (targetDate: Date, targetTime?: string) => void;
  
  // Drag events
  onDragStart?: (event: IEvent, sourceDate: Date) => void;
  onDragEnd?: (event: IEvent, sourceDate: Date, targetDate?: Date) => void;
  onDrop?: (event: IEvent, sourceDate: Date, targetDate: Date, targetTime?: string) => void;
}

const DndContext = createContext<IDndContext | null>(null);

interface DndProviderProps {
  children: React.ReactNode;
  onDragStart?: (event: IEvent, sourceDate: Date) => void;
  onDragEnd?: (event: IEvent, sourceDate: Date, targetDate?: Date) => void;
  onDrop?: (event: IEvent, sourceDate: Date, targetDate: Date, targetTime?: string) => void;
}

export function DndProvider({ 
  children,
  onDragStart,
  onDragEnd,
  onDrop
}: DndProviderProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragData, setDragData] = React.useState<IDragData | null>(null);

  const startDrag = useCallback((event: IEvent, sourceDate: Date, sourceTime?: string) => {
    const data: IDragData = {
      event,
      sourceDate,
      sourceTime
    };
    
    setDragData(data);
    setIsDragging(true);
    
    // Call external handler
    onDragStart?.(event, sourceDate);
  }, [onDragStart]);

  const endDrag = useCallback(() => {
    const currentDragData = dragData;
    
    setIsDragging(false);
    setDragData(null);
    
    // Call external handler
    if (currentDragData) {
      onDragEnd?.(currentDragData.event, currentDragData.sourceDate);
    }
  }, [dragData, onDragEnd]);

  const handleDrop = useCallback((targetDate: Date, targetTime?: string) => {
    if (!dragData) return;
    
    const { event, sourceDate } = dragData;
    
    // Call external handler
    onDrop?.(event, sourceDate, targetDate, targetTime);
    
    // End the drag operation
    endDrag();
  }, [dragData, onDrop, endDrag]);

  // Memoized context value
  const contextValue = useMemo<IDndContext>(() => ({
    // Drag state
    isDragging,
    dragData,
    
    // Drag operations
    startDrag,
    endDrag,
    
    // Drop operations
    handleDrop,
    
    // Drag events
    onDragStart,
    onDragEnd,
    onDrop,
  }), [
    isDragging,
    dragData,
    startDrag,
    endDrag,
    handleDrop,
    onDragStart,
    onDragEnd,
    onDrop,
  ]);

  return (
    <DndContext.Provider value={contextValue}>
      {children}
    </DndContext.Provider>
  );
}

export function useDndContext(): IDndContext {
  const context = useContext(DndContext);
  if (!context) {
    throw new Error('useDndContext must be used within a DndProvider');
  }
  return context;
}