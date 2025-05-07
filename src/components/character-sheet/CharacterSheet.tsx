
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/contexts/SocketContext';
import { Character } from '@/types/character';
import { createDefaultCharacter } from '@/utils/characterUtils';

// Custom components
import CharacterContent from './CharacterContent';
import CharacterTabs from './CharacterTabs';
import CharacterInfoHeader from './CharacterInfoHeader';
import SaveCharacterButton from './SaveCharacterButton';
import CharacterExportPDF from './CharacterExportPDF';
import { CharacterHeader } from './CharacterHeader';
import LevelUpPanel from './LevelUpPanel';
import { HPBar } from './HPBar';
import DicePanel from './DicePanel';
import ResourcePanel from './ResourcePanel';
import RestPanel from './RestPanel';
