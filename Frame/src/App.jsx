import React, { useState, useEffect } from 'react';
import { Search, Save, Upload, Plus, Trash2, Database, FileText, List, GitBranch, Calculator, Info, Terminal, Settings, Zap } from 'lucide-react';

const RetroFrameSystem = () => {
  const [frames, setFrames] = useState({});
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [queryText, setQueryText] = useState('');
  const [queryResult, setQueryResult] = useState('');
  const [activeTab, setActiveTab] = useState('editor');
  const [sheetStatus, setSheetStatus] = useState('');
  const [showInheritance, setShowInheritance] = useState(true);
  const [scanlineEffect, setScanlineEffect] = useState(true);
  const [kbProperties, setKbProperties] = useState({
    name: 'Sistema Solar KB',
    description: 'Base de coneixement sobre el sistema solar',
    author: '',
    version: '1.0',
    created: new Date().toISOString().split('T')[0],
    modified: new Date().toISOString().split('T')[0],
    domain: 'Astronomia',
    language: 'Català'
  });
  const [nlInput, setNlInput] = useState('');
  const [nlSuggestions, setNlSuggestions] = useState([]);

  // Facets estàndard
  const STANDARD_FACETS = {
    VALUE: { type: 'value', description: 'Valor actual del slot', default: [] },
    TIPUS: { type: 'select', description: 'Tipus de dades', options: ['string', 'number', 'boolean', 'frame', 'list'], default: ['string'] },
    RANG: { type: 'value', description: 'Valors possibles o rang', default: [] },
    CARDINALITAT: { type: 'select', description: 'Quantitat de valors', options: ['1', '0..1', '1..N', '0..N', 'N'], default: ['1'] },
    ORIGEN: { type: 'select', description: 'Origen de la informació', options: ['informat', 'calculat', 'heretat'], default: ['informat'] },
    FORMULA: { type: 'text', description: 'Fórmula de càlcul', default: [] },
    HERENCIA: { type: 'select', description: "Tipus d'herència", options: ['cap', 'ascendent', 'descendent', 'bidireccional'], default: ['cap'] },
    OBLIGATORI: { type: 'select', description: 'Obligatori?', options: ['si', 'no'], default: ['no'] },
    PER_DEFECTE: { type: 'value', description: 'Valor per defecte', default: [] },
    RESTRICCIO: { type: 'text', description: 'Restricció', default: [] },
    UNITATS: { type: 'text', description: 'Unitats', default: [] },
    DESCRIPCIO: { type: 'text', description: 'Descripció', default: [] }
  };

  // Base de coneixement d'exemple
  useEffect(() => {
    const kb = {
      'FRAME_GENERIC': {
        IS_A: { VALUE: { value: [] } }
      },
      'Cos_Celeste': {
        IS_A: { VALUE: { value: ['FRAME_GENERIC'] } },
        massa_kg: {
          VALUE: { value: [] },
          TIPUS: { value: ['number'] },
          HERENCIA: { value: ['descendent'] },
          UNITATS: { value: ['kg'] }
        }
      },
      'Planeta': {
        IS_A: { VALUE: { value: ['Cos_Celeste'] } },
        diàmetre_km: {
          VALUE: { value: [] },
          TIPUS: { value: ['number'] },
          HERENCIA: { value: ['descendent'] },
          UNITATS: { value: ['km'] }
        },
        òrbita: {
          VALUE: { value: ["Al voltant d'una estrella"] },
          HERENCIA: { value: ['ascendent'] }
        }
      },
      'Satèl·lit': {
        IS_A: { VALUE: { value: ['Cos_Celeste'] } },
        tipus_òrbita: {
          VALUE: { value: ["Al voltant d'un planeta"] },
          HERENCIA: { value: ['ascendent'] }
        },
        planeta_pare: {
          VALUE: { value: [] },
          TIPUS: { value: ['string'] },
          OBLIGATORI: { value: ['si'] }
        }
      },
      'Sistema_Solar': {
        IS_A: { VALUE: { value: ['FRAME_GENERIC'] } },
        planetes: {
          VALUE: { value: ['Mercuri', 'Venus', 'Terra', 'Mart', 'Júpiter', 'Saturn', 'Urà', 'Neptú'] },
          TIPUS: { value: ['list'] }
        },
        nombre_planetes: {
          VALUE: { value: [8] },
          TIPUS: { value: ['number'] },
          ORIGEN: { value: ['calculat'] },
          FORMULA: { value: ['count(planetes.VALUE)'] }
        }
      },
      'Terra': {
        IS_A: { VALUE: { value: ['Planeta'] } },
        nom: { VALUE: { value: ['Terra'] } },
        diàmetre_km: { VALUE: { value: [12742] } },
        massa_kg: { VALUE: { value: [5.972e24] } }
      },
      'Lluna': {
        IS_A: { VALUE: { value: ['Satèl·lit'] } },
        nom: { VALUE: { value: ['Lluna'] } },
        planeta_pare: { VALUE: { value: ['Terra'] } },
        diàmetre_km: { VALUE: { value: [3474] } }
      }
    };
    setFrames(kb);
  }, []);

  // Storage amb propietats
  useEffect(() => {
    if (Object.keys(frames).length > 0) {
      try {
        localStorage.setItem('frames-kb-retro', JSON.stringify(frames));
        localStorage.setItem('kb-properties', JSON.stringify(kbProperties));
      } catch (err) {
        // localStorage not available
      }
      setKbProperties(prev => ({
        ...prev,
        modified: new Date().toISOString().split('T')[0]
      }));
    }
  }, [frames]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('frames-kb-retro');
      if (stored) {
        setFrames(JSON.parse(stored));
      }
      const props = localStorage.getItem('kb-properties');
      if (props) {
        setKbProperties(JSON.parse(props));
      }
    } catch (err) {
      console.log('No saved data');
    }
  }, []);

  // Jerarquia IS-A
  const getIsAHierarchy = (frameName) => {
    const hierarchy = [frameName];
    let current = frameName;
    const visited = new Set();

    while (frames[current]?.IS_A?.VALUE?.value?.[0]) {
      const parent = frames[current].IS_A.VALUE.value[0];
      if (visited.has(parent)) break;
      visited.add(parent);
      hierarchy.push(parent);
      current = parent;
    }

    return hierarchy;
  };

  // Obtenir tots els slots amb herència
  const getAllSlots = (frameName) => {
    const allSlots = {};
    const hierarchy = getIsAHierarchy(frameName).reverse();

    hierarchy.forEach(frame => {
      if (frames[frame]) {
        Object.keys(frames[frame]).forEach(slotName => {
          if (slotName === 'IS_A' || slotName === '_meta') return;

          const slot = frames[frame][slotName];
          const herencia = slot.HERENCIA?.value?.[0] || 'cap';

          if (frame === frameName || herencia === 'ascendent' || herencia === 'bidireccional' || herencia === 'descendent') {
            if (!allSlots[slotName]) {
              allSlots[slotName] = {
                ...slot,
                _inherited_from: frame !== frameName ? frame : null,
                _overridden: false
              };
            } else if (frame === frameName) {
              const wasInherited = allSlots[slotName]._inherited_from !== null;
              allSlots[slotName] = {
                ...slot,
                _inherited_from: null,
                _overridden: wasInherited,
                _overridden_from: wasInherited ? allSlots[slotName]._inherited_from : null
              };
            }
          }
        });
      }
    });

    return allSlots;
  };

  // Càlcul de valors derivats
  const calculateDerivedValue = (frameName, slotName) => {
    const formula = frames[frameName]?.[slotName]?.FORMULA?.value?.[0];
    if (!formula) return null;

    try {
      if (formula.includes('count(')) {
        const match = formula.match(/count\((\w+)\.VALUE\)/);
        if (match) {
          const targetSlot = match[1];
          const allSlots = getAllSlots(frameName);
          const values = allSlots[targetSlot]?.VALUE?.value;
          return values ? [values.length] : [0];
        }
      }

      const evalFormula = formula.replace(/(\w+)\.VALUE/g, (_match, sName) => {
        const allSlots = getAllSlots(frameName);
        const val = allSlots[sName]?.VALUE?.value;
        return val && val.length > 0 ? val[0] : 0;
      });

      const result = Function('"use strict"; return (' + evalFormula + ')')();
      return [Math.round(result * 100) / 100];
    } catch (err) {
      return null;
    }
  };

  // CRUD Operations
  const addFrame = () => {
    const frameName = prompt('>>> NOM DEL NOU FRAME:');
    if (frameName && !frames[frameName]) {
      setFrames({
        ...frames,
        [frameName]: {
          IS_A: { VALUE: { value: ['FRAME_GENERIC'] } }
        }
      });
      setSelectedFrame(frameName);
    }
  };

  const deleteFrame = (frameName) => {
    if (confirm(`>>> ELIMINAR "${frameName}"? (S/N)`)) {
      const newFrames = { ...frames };
      delete newFrames[frameName];
      setFrames(newFrames);
      if (selectedFrame === frameName) setSelectedFrame(null);
    }
  };

  const addSlot = (frameName) => {
    const slotName = prompt('>>> NOM DEL NOU SLOT:');
    if (slotName && !frames[frameName][slotName]) {
      const newSlot = {};
      Object.keys(STANDARD_FACETS).forEach(facet => {
        newSlot[facet] = { value: [...STANDARD_FACETS[facet].default] };
      });

      setFrames({
        ...frames,
        [frameName]: {
          ...frames[frameName],
          [slotName]: newSlot
        }
      });
    }
  };

  const updateFacet = (frameName, slotName, facetName, newValue) => {
    let values;

    if (facetName === 'FORMULA' || facetName === 'DESCRIPCIO' || facetName === 'RESTRICCIO') {
      values = newValue.trim() ? [newValue] : [];
    } else {
      values = newValue.split(',').map(v => {
        v = v.trim();
        const num = Number(v);
        return isNaN(num) ? v : num;
      }).filter(v => v !== '');
    }

    setFrames({
      ...frames,
      [frameName]: {
        ...frames[frameName],
        [slotName]: {
          ...frames[frameName][slotName],
          [facetName]: { value: values }
        }
      }
    });
  };

  // Consultes
  const processQuery = (query) => {
    query = query.toLowerCase();

    const countMatch = query.match(/quants?\s+(\w+)\s+(?:hi\s+ha|té)\s+(?:a|al|en)?\s*(.+)\??/i);
    if (countMatch) {
      const [, what, where] = countMatch;
      const frame = Object.keys(frames).find(f =>
        f.toLowerCase().replace(/_/g, ' ').includes(where.trim())
      );

      if (frame) {
        const allSlots = getAllSlots(frame);
        const slot = Object.keys(allSlots).find(s => s.toLowerCase().includes(what));

        if (slot) {
          const origen = allSlots[slot].ORIGEN?.value?.[0];
          let value = allSlots[slot].VALUE?.value;

          if (origen === 'calculat') {
            const calculated = calculateDerivedValue(frame, slot);
            if (calculated) value = calculated;
          }

          if (value && value.length > 0) {
            return `>>> ${value[0]} ${what.toUpperCase()}`;
          }
        }
      }
      return `>>> ERROR: NO TROBAT`;
    }

    const whatIsMatch = query.match(/qu[èe]\s+[éè]s\s+(.+)\??/i);
    if (whatIsMatch) {
      const thing = whatIsMatch[1].trim();
      const frame = Object.keys(frames).find(f =>
        f.toLowerCase().replace(/_/g, ' ') === thing.toLowerCase()
      );

      if (frame) {
        const hierarchy = getIsAHierarchy(frame);
        let response = `>>> ${frame.toUpperCase()} IS-A ${hierarchy[1]?.toUpperCase() || 'ELEMENT'}`;
        response += '\n>>> JERARQUIA: ' + hierarchy.join(' -> ');

        const allSlots = getAllSlots(frame);
        const displaySlots = Object.keys(allSlots)
          .filter(s => allSlots[s].VALUE?.value?.length > 0)
          .slice(0, 4);

        if (displaySlots.length > 0) {
          response += '\n>>> PROPIETATS:';
          displaySlots.forEach(slot => {
            const value = allSlots[slot].VALUE.value;
            const overridden = allSlots[slot]._overridden ? ' [OVERRIDE]' : '';
            response += `\n    ${slot}: ${value.join(', ')}${overridden}`;
          });
        }

        return response;
      }
    }

    const orbitMatch = query.match(/(?:on|al\s+voltant)\s+(?:orbita|gira)\s+(.+)\??/i);
    if (orbitMatch) {
      const thing = orbitMatch[1].trim();
      const frame = Object.keys(frames).find(f =>
        f.toLowerCase() === thing.toLowerCase()
      );

      if (frame) {
        const allSlots = getAllSlots(frame);
        if (allSlots.planeta_pare?.VALUE?.value?.[0]) {
          return `>>> ${frame.toUpperCase()} ORBITA: ${allSlots.planeta_pare.VALUE.value[0].toUpperCase()}`;
        } else if (allSlots.tipus_òrbita?.VALUE?.value?.[0]) {
          return `>>> ${frame.toUpperCase()}: ${allSlots.tipus_òrbita.VALUE.value[0].toUpperCase()}`;
        }
      }
    }

    return '>>> SINTAXI INVALIDA. PROVEU: "QUE ES X?" O "QUANTS X HI HA?"';
  };

  const handleQuery = () => {
    const result = processQuery(queryText);
    setQueryResult(result);
  };

  // Export/Import amb propietats
  const exportToTSV = async () => {
    setSheetStatus('>>> EXPORTANT…');

    // Metadata header
    let output = `# KNOWLEDGE BASE EXPORT\n`;
    output += `# Name: ${kbProperties.name}\n`;
    output += `# Description: ${kbProperties.description}\n`;
    output += `# Author: ${kbProperties.author}\n`;
    output += `# Version: ${kbProperties.version}\n`;
    output += `# Domain: ${kbProperties.domain}\n`;
    output += `# Language: ${kbProperties.language}\n`;
    output += `# Created: ${kbProperties.created}\n`;
    output += `# Modified: ${kbProperties.modified}\n`;
    output += `#\n`;

    const rows = [['Frame', 'Slot', 'Facet', 'Value']];
    Object.keys(frames).forEach(frameName => {
      Object.keys(frames[frameName]).forEach(slotName => {
        const slot = frames[frameName][slotName];
        Object.keys(slot).forEach(facetName => {
          if (slot[facetName]?.value) {
            slot[facetName].value.forEach(val => {
              rows.push([frameName, slotName, facetName, String(val)]);
            });
          }
        });
      });
    });

    output += rows.map(row => row.join('\t')).join('\n');

    const blob = new Blob([output], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${kbProperties.name.replace(/\s+/g, '_')}_v${kbProperties.version}.tsv`;
    a.click();

    setSheetStatus('>>> EXPORT OK');
  };

  const importFromTSV = (tsvText) => {
    try {
      setSheetStatus('>>> IMPORTANT…');
      const lines = tsvText.trim().split('\n');

      // Parse metadata
      const metadata = {};
      let dataStartIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#')) {
          const match = lines[i].match(/# (\w+): (.+)/);
          if (match) {
            metadata[match[1]] = match[2];
          }
          dataStartIndex = i + 1;
        } else {
          break;
        }
      }

      // Update properties if metadata found
      if (Object.keys(metadata).length > 0) {
        setKbProperties(prev => ({
          ...prev,
          ...metadata
        }));
      }

      const newFrames = {};

      // Skip header and metadata
      lines.slice(dataStartIndex + 1).forEach(line => {
        const parts = line.split('\t');
        if (parts.length < 4) return;

        const [frameName, slotName, facetName, value] = parts;

        if (!newFrames[frameName]) newFrames[frameName] = {};
        if (!newFrames[frameName][slotName]) newFrames[frameName][slotName] = {};
        if (!newFrames[frameName][slotName][facetName]) {
          newFrames[frameName][slotName][facetName] = { value: [] };
        }

        const parsedValue = isNaN(Number(value)) ? value : Number(value);
        newFrames[frameName][slotName][facetName].value.push(parsedValue);
      });

      setFrames(newFrames);
      setSelectedFrame(null);
      setSelectedSlot(null);

      const frameCount = Object.keys(newFrames).length;
      setSheetStatus(`>>> IMPORT OK: ${frameCount} FRAMES`);
    } catch (err) {
      setSheetStatus('>>> ERROR: FORMAT INVALID');
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      importFromTSV(e.target.result);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Parser de llenguatge natural per crear frames
  const parseNaturalLanguage = (text) => {
    const suggestions = [];
    text = text.toLowerCase().trim();

    // Pattern: "X és un Y" o "X es un Y"
    const isAMatch = text.match(/^(.+?)\s+[eé]s\s+un(?:a)?\s+(.+)$/i);
    if (isAMatch) {
      const [, entity, type] = isAMatch;
      const entityName = entity.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('_');
      const typeName = type.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('_');

      suggestions.push({
        type: 'IS_A',
        frame: entityName,
        parent: typeName,
        description: `Crear frame "${entityName}" com a tipus de "${typeName}"`
      });

      // Suggerir crear el tipus si no existeix
      if (!frames[typeName]) {
        suggestions.push({
          type: 'CREATE_PARENT',
          frame: typeName,
          description: `Crear també el frame pare "${typeName}"`
        });
      }
    }

    // Pattern: "X té/tenen Y" o "X amb Y"
    const hasMatch = text.match(/^(.+?)\s+(?:té|tenen|amb)\s+(.+)$/i);
    if (hasMatch) {
      const [, entity, property] = hasMatch;
      const entityName = entity.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('_');
      const propertyName = property.trim().replace(/\s+/g, '_');

      suggestions.push({
        type: 'ADD_SLOT',
        frame: entityName,
        slot: propertyName,
        description: `Afegir slot "${propertyName}" al frame "${entityName}"`
      });
    }

    // Pattern: "X de Y és Z" (propietat amb valor)
    const propertyMatch = text.match(/^(?:el |la |els |les )?(.+?)\s+de\s+(.+?)\s+[eé]s\s+(.+)$/i);
    if (propertyMatch) {
      const [, property, entity, value] = propertyMatch;
      const entityName = entity.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('_');
      const propertyName = property.trim().replace(/\s+/g, '_');
      const propertyValue = value.trim();

      suggestions.push({
        type: 'SET_VALUE',
        frame: entityName,
        slot: propertyName,
        value: propertyValue,
        description: `Al frame "${entityName}", establir "${propertyName}" = "${propertyValue}"`
      });
    }

    // Pattern: "crear frame X"
    const createMatch = text.match(/^crear\s+(?:frame\s+)?(.+)$/i);
    if (createMatch) {
      const frameName = createMatch[1].trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('_');
      suggestions.push({
        type: 'CREATE',
        frame: frameName,
        description: `Crear nou frame "${frameName}"`
      });
    }

    return suggestions;
  };

  const applyNLSuggestion = (suggestion) => {
    const newFrames = { ...frames };

    switch (suggestion.type) {
      case 'IS_A':
        if (!newFrames[suggestion.frame]) {
          newFrames[suggestion.frame] = {
            IS_A: { VALUE: { value: [suggestion.parent] } }
          };
        } else {
          newFrames[suggestion.frame].IS_A = { VALUE: { value: [suggestion.parent] } };
        }
        setSelectedFrame(suggestion.frame);
        setNlInput('');
        setNlSuggestions([]);
        break;

      case 'CREATE_PARENT':
        if (!newFrames[suggestion.frame]) {
          newFrames[suggestion.frame] = {
            IS_A: { VALUE: { value: ['FRAME_GENERIC'] } }
          };
        }
        break;

      case 'ADD_SLOT':
        if (!newFrames[suggestion.frame]) {
          newFrames[suggestion.frame] = {
            IS_A: { VALUE: { value: ['FRAME_GENERIC'] } }
          };
        }
        if (!newFrames[suggestion.frame][suggestion.slot]) {
          const newSlot = {};
          Object.keys(STANDARD_FACETS).forEach(facet => {
            newSlot[facet] = { value: [...STANDARD_FACETS[facet].default] };
          });
          newFrames[suggestion.frame][suggestion.slot] = newSlot;
        }
        setSelectedFrame(suggestion.frame);
        setSelectedSlot(suggestion.slot);
        setNlInput('');
        setNlSuggestions([]);
        break;

      case 'SET_VALUE':
        if (!newFrames[suggestion.frame]) {
          newFrames[suggestion.frame] = {
            IS_A: { VALUE: { value: ['FRAME_GENERIC'] } }
          };
        }
        if (!newFrames[suggestion.frame][suggestion.slot]) {
          const newSlot = {};
          Object.keys(STANDARD_FACETS).forEach(facet => {
            newSlot[facet] = { value: [...STANDARD_FACETS[facet].default] };
          });
          newFrames[suggestion.frame][suggestion.slot] = newSlot;
        }

        // Detectar si és número
        const numValue = Number(suggestion.value);
        const finalValue = isNaN(numValue) ? suggestion.value : numValue;

        newFrames[suggestion.frame][suggestion.slot].VALUE = { value: [finalValue] };
        if (!isNaN(numValue)) {
          newFrames[suggestion.frame][suggestion.slot].TIPUS = { value: ['number'] };
        }

        setSelectedFrame(suggestion.frame);
        setSelectedSlot(suggestion.slot);
        setNlInput('');
        setNlSuggestions([]);
        break;

      case 'CREATE':
        if (!newFrames[suggestion.frame]) {
          newFrames[suggestion.frame] = {
            IS_A: { VALUE: { value: ['FRAME_GENERIC'] } }
          };
        }
        setSelectedFrame(suggestion.frame);
        setNlInput('');
        setNlSuggestions([]);
        break;

      default:
        break;
    }

    setFrames(newFrames);
  };

  const handleNLInput = () => {
    const suggestions = parseNaturalLanguage(nlInput);
    setNlSuggestions(suggestions);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4 relative overflow-hidden">
      {/* Scanline effect */}
      {scanlineEffect && (
        <div className="fixed inset-0 pointer-events-none z-50 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.1) 2px, rgba(0, 255, 0, 0.1) 4px)',
            animation: 'scan 8s linear infinite'
          }} />
      )}

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .blink-cursor::after {
          content: '█';
          animation: blink 1s infinite;
        }
        .retro-border {
          border: 2px solid #00ff00;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.5), inset 0 0 10px rgba(0, 255, 0, 0.1);
        }
        .retro-glow {
          text-shadow: 0 0 5px rgba(0, 255, 0, 0.7);
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 retro-border p-4 bg-black bg-opacity-80">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold retro-glow flex items-center gap-3 mb-1">
                <Terminal className="w-8 h-8" />
                {kbProperties.name.toUpperCase()}
              </h1>
              <p className="text-green-500 text-sm">{'>'} {kbProperties.description}</p>
            </div>
            <div className="text-right text-sm">
              <div>{'>'} VERSION: {kbProperties.version}</div>
              <div>{'>'} FRAMES: {Object.keys(frames).length}</div>
              <div className="flex items-center gap-2 mt-1 justify-end">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scanlineEffect}
                    onChange={(e) => setScanlineEffect(e.target.checked)}
                    className="w-4 h-4"
                  />
                  SCANLINES
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { id: 'nlcreate', icon: Zap, label: 'NL CREATE' },
            { id: 'editor', icon: FileText, label: 'EDITOR' },
            { id: 'query', icon: Search, label: 'QUERY' },
            { id: 'hierarchy', icon: GitBranch, label: 'HIERARCHY' },
            { id: 'rules', icon: Calculator, label: 'RULES' },
            { id: 'properties', icon: Settings, label: 'PROPERTIES' },
            { id: 'sync', icon: Save, label: 'I/O' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 retro-border transition-all ${
                activeTab === tab.id
                  ? 'bg-green-900 bg-opacity-50 retro-glow'
                  : 'bg-black hover:bg-green-900 hover:bg-opacity-30'
              }`}
            >
              <tab.icon className="inline w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* NL CREATE TAB */}
        {activeTab === 'nlcreate' && (
          <div className="retro-border p-6 bg-black bg-opacity-80">
            <h2 className="text-2xl retro-glow mb-4">{'>'} NATURAL LANGUAGE FRAME CREATION</h2>

            <div className="mb-6">
              <label className="block text-sm retro-glow mb-2">ESCRIU EN LLENGUATGE NATURAL:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nlInput}
                  onChange={(e) => setNlInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNLInput()}
                  className="flex-1 p-3 bg-black text-green-400 retro-border blink-cursor"
                  placeholder="Ex: La Terra és un planeta habitable..."
                />
                <button
                  onClick={handleNLInput}
                  className="retro-border px-6 py-3 hover:bg-green-900 hover:bg-opacity-30 retro-glow"
                >
                  <Zap className="w-5 h-5" />
                </button>
              </div>
            </div>

            {nlSuggestions.length > 0 && (
              <div className="space-y-3 mb-6">
                <h3 className="text-lg retro-glow">{'>'} PROPOSTES:</h3>
                {nlSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="retro-border p-4 bg-green-900 bg-opacity-20">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm text-green-600 mb-1">
                          [{suggestion.type}]
                        </div>
                        <div className="retro-glow">{suggestion.description}</div>
                      </div>
                      <button
                        onClick={() => applyNLSuggestion(suggestion)}
                        className="retro-border px-4 py-2 hover:bg-green-900 hover:bg-opacity-50 retro-glow"
                      >
                        APLICAR
                      </button>
                    </div>
                    <div className="text-xs text-green-600 mt-2">
                      {suggestion.type === 'IS_A' && `${suggestion.frame} → ${suggestion.parent}`}
                      {suggestion.type === 'ADD_SLOT' && `${suggestion.frame}.${suggestion.slot}`}
                      {suggestion.type === 'SET_VALUE' && `${suggestion.frame}.${suggestion.slot} = ${suggestion.value}`}
                      {suggestion.type === 'CREATE' && `NEW: ${suggestion.frame}`}
                      {suggestion.type === 'CREATE_PARENT' && `NEW: ${suggestion.frame}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="retro-border p-4 bg-blue-900 bg-opacity-20">
              <h3 className="retro-glow mb-3">EXEMPLES DE SINTAXI SUPORTADA:</h3>
              <div className="space-y-2 text-sm text-green-600">
                <div>
                  <span className="text-cyan-400">IS-A:</span>
                  <div className="ml-4">{'\u2022'} &quot;La Terra és un planeta habitable&quot;</div>
                  <div className="ml-4">{'\u2022'} &quot;Júpiter es un gegant gasós&quot;</div>
                </div>
                <div>
                  <span className="text-cyan-400">PROPIETATS:</span>
                  <div className="ml-4">{'\u2022'} &quot;La Terra té atmosfera&quot;</div>
                  <div className="ml-4">{'\u2022'} &quot;Júpiter amb tempestes&quot;</div>
                </div>
                <div>
                  <span className="text-cyan-400">VALORS:</span>
                  <div className="ml-4">{'\u2022'} &quot;El diàmetre de la Terra és 12742&quot;</div>
                  <div className="ml-4">{'\u2022'} &quot;La massa de Júpiter és 1.898e27&quot;</div>
                </div>
                <div>
                  <span className="text-cyan-400">CREAR:</span>
                  <div className="ml-4">{'\u2022'} &quot;Crear frame Mart&quot;</div>
                  <div className="ml-4">{'\u2022'} &quot;Crear planeta rocós&quot;</div>
                </div>
              </div>
            </div>

            <div className="retro-border p-4 bg-yellow-900 bg-opacity-20 mt-4">
              <h3 className="text-yellow-400 retro-glow mb-2">{'>'} CONSELL:</h3>
              <p className="text-sm text-yellow-600">
                El sistema detecta automàticament el tipus de dades (nombres vs text) i crea els frames pare si no existeixen.
                Pots encadenar múltiples frases per construir la base de coneixement ràpidament.
              </p>
            </div>
          </div>
        )}

        {/* PROPERTIES TAB */}
        {activeTab === 'properties' && (
          <div className="retro-border p-6 bg-black bg-opacity-80">
            <h2 className="text-2xl retro-glow mb-4">{'>'} KB PROPERTIES</h2>

            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm retro-glow mb-1">NAME:</label>
                <input
                  type="text"
                  value={kbProperties.name}
                  onChange={(e) => setKbProperties({...kbProperties, name: e.target.value})}
                  className="w-full p-2 bg-black text-green-400 retro-border"
                />
              </div>

              <div>
                <label className="block text-sm retro-glow mb-1">DESCRIPTION:</label>
                <textarea
                  value={kbProperties.description}
                  onChange={(e) => setKbProperties({...kbProperties, description: e.target.value})}
                  className="w-full p-2 bg-black text-green-400 retro-border h-20"
                />
              </div>

              <div>
                <label className="block text-sm retro-glow mb-1">AUTHOR:</label>
                <input
                  type="text"
                  value={kbProperties.author}
                  onChange={(e) => setKbProperties({...kbProperties, author: e.target.value})}
                  className="w-full p-2 bg-black text-green-400 retro-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm retro-glow mb-1">VERSION:</label>
                  <input
                    type="text"
                    value={kbProperties.version}
                    onChange={(e) => setKbProperties({...kbProperties, version: e.target.value})}
                    className="w-full p-2 bg-black text-green-400 retro-border"
                  />
                </div>

                <div>
                  <label className="block text-sm retro-glow mb-1">DOMAIN:</label>
                  <input
                    type="text"
                    value={kbProperties.domain}
                    onChange={(e) => setKbProperties({...kbProperties, domain: e.target.value})}
                    className="w-full p-2 bg-black text-green-400 retro-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm retro-glow mb-1">LANGUAGE:</label>
                  <select
                    value={kbProperties.language}
                    onChange={(e) => setKbProperties({...kbProperties, language: e.target.value})}
                    className="w-full p-2 bg-black text-green-400 retro-border"
                  >
                    <option value="Català">Català</option>
                    <option value="English">English</option>
                    <option value="Español">Español</option>
                    <option value="Français">Français</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm retro-glow mb-1">CREATED:</label>
                  <input
                    type="date"
                    value={kbProperties.created}
                    onChange={(e) => setKbProperties({...kbProperties, created: e.target.value})}
                    className="w-full p-2 bg-black text-green-400 retro-border"
                  />
                </div>
              </div>

              <div className="retro-border p-3 bg-green-900 bg-opacity-20">
                <div className="text-sm text-green-600">LAST MODIFIED: {kbProperties.modified}</div>
              </div>
            </div>
          </div>
        )}

        {/* EDITOR TAB */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="retro-border p-4 bg-black bg-opacity-80">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg retro-glow">{'>'} FRAMES</h2>
                <button onClick={addFrame} className="retro-border px-2 py-1 hover:bg-green-900 hover:bg-opacity-30">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1 max-h-[600px] overflow-y-auto">
                {Object.keys(frames).map(frameName => (
                  <div
                    key={frameName}
                    className={`p-2 retro-border cursor-pointer ${selectedFrame === frameName ? 'bg-green-900 bg-opacity-50' : 'hover:bg-green-900 hover:bg-opacity-20'}`}
                    onClick={() => { setSelectedFrame(frameName); setSelectedSlot(null); }}
                  >
                    <div className="flex justify-between items-center text-sm">
                      <div className="retro-glow">{frameName}</div>
                      <button onClick={(e) => { e.stopPropagation(); deleteFrame(frameName); }} className="text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedFrame && (
              <div className="retro-border p-4 bg-black bg-opacity-80">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg retro-glow">{'>'} SLOTS</h2>
                  <button onClick={() => addSlot(selectedFrame)} className="retro-border px-2 py-1">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <label className="flex items-center gap-2 text-xs mb-3">
                  <input type="checkbox" checked={showInheritance} onChange={(e) => setShowInheritance(e.target.checked)} />
                  SHOW INHERITED
                </label>
                <div className="space-y-1 max-h-[540px] overflow-y-auto">
                  {Object.keys(showInheritance ? getAllSlots(selectedFrame) : frames[selectedFrame])
                    .filter(s => s !== 'IS_A' && s !== '_meta')
                    .map(slotName => {
                      const allSlots = getAllSlots(selectedFrame);
                      const isOverridden = allSlots[slotName]?._overridden;
                      return (
                        <div key={slotName} className={`p-2 retro-border cursor-pointer text-sm ${selectedSlot === slotName ? 'bg-green-900 bg-opacity-50' : ''}`}
                          onClick={() => setSelectedSlot(slotName)}>
                          <div className="retro-glow">{slotName}</div>
                          {isOverridden && <div className="text-xs text-yellow-400">[OVERRIDE]</div>}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {selectedFrame && selectedSlot && (
              <div className="lg:col-span-2 retro-border p-4 bg-black bg-opacity-80">
                <h2 className="text-xl retro-glow mb-4">{'>'} {selectedFrame} → {selectedSlot}</h2>
                <div className="space-y-3 max-h-[540px] overflow-y-auto">
                  {Object.keys(STANDARD_FACETS).map(facetName => {
                    const currentValue = frames[selectedFrame]?.[selectedSlot]?.[facetName]?.value || [];
                    const facetDef = STANDARD_FACETS[facetName];
                    return (
                      <div key={facetName} className="retro-border p-2 bg-black bg-opacity-60">
                        <label className="block text-xs retro-glow mb-1">{facetName}</label>
                        {facetDef.type === 'select' ? (
                          <select value={currentValue[0] || ''} onChange={(e) => updateFacet(selectedFrame, selectedSlot, facetName, e.target.value)}
                            className="w-full p-1 bg-black text-green-400 retro-border text-sm">
                            <option value="">--</option>
                            {facetDef.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input type="text" value={facetName === 'FORMULA' || facetName === 'DESCRIPCIO' ? (currentValue[0] || '') : currentValue.join(', ')}
                            onChange={(e) => updateFacet(selectedFrame, selectedSlot, facetName, e.target.value)}
                            className="w-full p-1 bg-black text-green-400 retro-border text-sm" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* QUERY TAB */}
        {activeTab === 'query' && (
          <div className="retro-border p-6 bg-black bg-opacity-80">
            <h2 className="text-2xl retro-glow mb-4">{'>'} QUERY INTERFACE</h2>
            <div className="mb-6">
              <div className="flex gap-2">
                <input type="text" value={queryText} onChange={(e) => setQueryText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                  className="flex-1 p-3 bg-black text-green-400 retro-border blink-cursor" placeholder="ENTER QUERY..." />
                <button onClick={handleQuery} className="retro-border px-6 py-3 hover:bg-green-900 hover:bg-opacity-30 retro-glow">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
            {queryResult && (
              <div className="retro-border p-4 mb-6 bg-green-900 bg-opacity-20 whitespace-pre-line font-bold">
                {queryResult}
              </div>
            )}
          </div>
        )}

        {/* I/O TAB */}
        {activeTab === 'sync' && (
          <div className="retro-border p-6 bg-black bg-opacity-80">
            <h2 className="text-2xl retro-glow mb-4">{'>'} INPUT/OUTPUT</h2>
            <div className="space-y-4">
              <button onClick={exportToTSV} className="w-full retro-border p-3 hover:bg-green-900 hover:bg-opacity-30 retro-glow flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                EXPORT TO TSV
              </button>
              <div className="retro-border p-3">
                <label className="retro-glow block mb-2">IMPORT FROM FILE:</label>
                <input type="file" accept=".tsv,.txt" onChange={handleFileImport} className="w-full p-2 bg-black text-green-400 retro-border" />
              </div>
              {sheetStatus && <div className="retro-border p-3 text-cyan-400 retro-glow">{sheetStatus}</div>}
            </div>
          </div>
        )}

        {/* HIERARCHY TAB */}
        {activeTab === 'hierarchy' && (
          <div className="retro-border p-6 bg-black bg-opacity-80">
            <h2 className="text-2xl retro-glow mb-4">{'>'} IS-A HIERARCHY</h2>
            <select onChange={(e) => setSelectedFrame(e.target.value)} value={selectedFrame || ''} className="w-full p-3 bg-black text-green-400 retro-border mb-6">
              <option value="">-- SELECT --</option>
              {Object.keys(frames).map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            {selectedFrame && (
              <div className="retro-border p-4">
                <h3 className="retro-glow mb-3">CHAIN:</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {getIsAHierarchy(selectedFrame).map((frame, idx, arr) => (
                    <React.Fragment key={frame}>
                      <div className="retro-border px-3 py-1">{frame}</div>
                      {idx < arr.length - 1 && <div>{'\u2192'}</div>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RULES TAB */}
        {activeTab === 'rules' && (
          <div className="retro-border p-6 bg-black bg-opacity-80">
            <h2 className="text-2xl retro-glow mb-4">{'>'} COMPUTED RULES</h2>
            {Object.keys(frames).map(frameName => {
              const calcSlots = Object.keys(frames[frameName]).filter(s => frames[frameName][s]?.ORIGEN?.value?.[0] === 'calculat');
              if (calcSlots.length === 0) return null;
              return (
                <div key={frameName} className="retro-border p-3 mb-3">
                  <h3 className="retro-glow">{frameName}</h3>
                  {calcSlots.map(s => (
                    <div key={s} className="text-sm mt-2">
                      <div>{s}: {calculateDerivedValue(frameName, s)?.join(', ')}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RetroFrameSystem;
