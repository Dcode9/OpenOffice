import { createElement, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity, AlarmClock, Anchor, Atom, Award, BadgeCheck, Banknote, Battery, Bell, Bike, Bluetooth, Book, Box,
  Briefcase, Brush, Bug, Bus, Calendar, Camera, Car, Cat, Check, Clock, Cloud, Coffee, Compass, Cpu, Crown,
  Diamond, Dog, Eye, Feather, Fish, Flag, Flame, Flower2, Folder, Gamepad2, Gift, Globe, GraduationCap,
  Handshake, Headphones, Heart, Key, Lamp, Laptop, Layers, Leaf, Library, Lightbulb, Link, Lock, Mail, Map,
  MapPin, Mic, Monitor, Moon, Package, Palette, PenTool, Phone, Pizza, Plane, Printer, Radio, Recycle, Rocket,
  Scissors, Search, Settings, Shield, Ship, ShoppingCart, Smartphone, Snowflake, Sparkles, Speaker, Star,
  Stethoscope, Sun, Target, Thermometer, TreePine, Trophy, Truck, Tv, Umbrella, User, Video, Wallet, Watch,
  Wifi, Wind, Wrench, Zap,
} from 'lucide-react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Editor } from '@tiptap/react'
import { insertSvg } from '../../editor/insertActions'
import { svgDataUri } from '../../editor/insertActions'
import { Popover } from '../ribbon/ui'
import '../../styles/insert-advanced.css'

const ICONS: { name: string; icon: LucideIcon }[] = [
  { name: 'Activity', icon: Activity }, { name: 'Alarm', icon: AlarmClock }, { name: 'Anchor', icon: Anchor },
  { name: 'Atom', icon: Atom }, { name: 'Award', icon: Award }, { name: 'Badge', icon: BadgeCheck },
  { name: 'Banknote', icon: Banknote }, { name: 'Battery', icon: Battery }, { name: 'Bell', icon: Bell },
  { name: 'Bike', icon: Bike }, { name: 'Bluetooth', icon: Bluetooth }, { name: 'Book', icon: Book },
  { name: 'Box', icon: Box }, { name: 'Briefcase', icon: Briefcase }, { name: 'Brush', icon: Brush },
  { name: 'Bug', icon: Bug }, { name: 'Bus', icon: Bus }, { name: 'Calendar', icon: Calendar },
  { name: 'Camera', icon: Camera }, { name: 'Car', icon: Car }, { name: 'Cat', icon: Cat },
  { name: 'Check', icon: Check }, { name: 'Clock', icon: Clock }, { name: 'Cloud', icon: Cloud },
  { name: 'Coffee', icon: Coffee }, { name: 'Compass', icon: Compass }, { name: 'Cpu', icon: Cpu },
  { name: 'Crown', icon: Crown }, { name: 'Diamond', icon: Diamond }, { name: 'Dog', icon: Dog },
  { name: 'Eye', icon: Eye }, { name: 'Feather', icon: Feather }, { name: 'Fish', icon: Fish },
  { name: 'Flag', icon: Flag }, { name: 'Flame', icon: Flame }, { name: 'Flower', icon: Flower2 },
  { name: 'Folder', icon: Folder }, { name: 'Gamepad', icon: Gamepad2 }, { name: 'Gift', icon: Gift },
  { name: 'Globe', icon: Globe }, { name: 'Graduation', icon: GraduationCap }, { name: 'Handshake', icon: Handshake },
  { name: 'Headphones', icon: Headphones }, { name: 'Heart', icon: Heart }, { name: 'Key', icon: Key },
  { name: 'Lamp', icon: Lamp }, { name: 'Laptop', icon: Laptop }, { name: 'Layers', icon: Layers },
  { name: 'Leaf', icon: Leaf }, { name: 'Library', icon: Library }, { name: 'Lightbulb', icon: Lightbulb },
  { name: 'Link', icon: Link }, { name: 'Lock', icon: Lock }, { name: 'Mail', icon: Mail },
  { name: 'Map', icon: Map }, { name: 'Map Pin', icon: MapPin }, { name: 'Mic', icon: Mic },
  { name: 'Monitor', icon: Monitor }, { name: 'Moon', icon: Moon }, { name: 'Package', icon: Package },
  { name: 'Palette', icon: Palette }, { name: 'Pen', icon: PenTool }, { name: 'Phone', icon: Phone },
  { name: 'Pizza', icon: Pizza }, { name: 'Plane', icon: Plane }, { name: 'Printer', icon: Printer },
  { name: 'Radio', icon: Radio }, { name: 'Recycle', icon: Recycle }, { name: 'Rocket', icon: Rocket },
  { name: 'Scissors', icon: Scissors }, { name: 'Search', icon: Search }, { name: 'Settings', icon: Settings },
  { name: 'Shield', icon: Shield }, { name: 'Ship', icon: Ship }, { name: 'Shopping', icon: ShoppingCart },
  { name: 'Smartphone', icon: Smartphone }, { name: 'Snowflake', icon: Snowflake }, { name: 'Sparkles', icon: Sparkles },
  { name: 'Speaker', icon: Speaker }, { name: 'Star', icon: Star }, { name: 'Stethoscope', icon: Stethoscope },
  { name: 'Sun', icon: Sun }, { name: 'Target', icon: Target }, { name: 'Thermometer', icon: Thermometer },
  { name: 'Tree', icon: TreePine }, { name: 'Trophy', icon: Trophy }, { name: 'Truck', icon: Truck },
  { name: 'Tv', icon: Tv }, { name: 'Umbrella', icon: Umbrella }, { name: 'User', icon: User },
  { name: 'Video', icon: Video }, { name: 'Wallet', icon: Wallet }, { name: 'Watch', icon: Watch },
  { name: 'Wifi', icon: Wifi }, { name: 'Wind', icon: Wind }, { name: 'Wrench', icon: Wrench }, { name: 'Zap', icon: Zap },
]

function iconSvg(icon: LucideIcon, size: number, color: string) {
  const markup = renderToStaticMarkup(
    createElement(icon, { size, color, strokeWidth: 1.8, absoluteStrokeWidth: true }),
  )
  if (markup.includes('xmlns=')) return markup
  return markup.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
}

export function IconsGallery({ editor, onInserted }: { editor: Editor; onInserted: (message: string) => void }) {
  const [query, setQuery] = useState('')
  const [color, setColor] = useState('#185abd')
  const [size, setSize] = useState(96)
  const filtered = useMemo(
    () => ICONS.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  const insert = (icon: LucideIcon, name: string) => {
    insertSvg(editor, iconSvg(icon, size, color), `${name} icon`)
    onInserted(`${name} icon inserted`)
  }

  return (
    <div className="ins-icons">
      <div className="ins-icons-toolbar">
        <span className="ins-search">
          <Search size={14} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search icons" autoFocus />
        </span>
        <label className="ins-mini-field">
          Color
          <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
        </label>
        <label className="ins-mini-field">
          Size
          <select value={size} onChange={(event) => setSize(Number(event.target.value))}>
            <option value={64}>Small</option>
            <option value={96}>Medium</option>
            <option value={144}>Large</option>
          </select>
        </label>
      </div>
      <div className="ins-icons-grid">
        {filtered.map(({ name, icon: Icon }) => (
          <button key={name} type="button" className="ins-icon-card" onClick={() => insert(Icon, name)} title={`Insert ${name}`}>
            <span className="ins-icon-art" style={{ color }}>
              <Icon size={24} strokeWidth={1.8} />
            </span>
            <span className="ins-icon-name">{name}</span>
          </button>
        ))}
      </div>
      {filtered.length === 0 && <div className="ins-empty">No icons match “{query}”.</div>}
      <div className="ins-icons-foot">
        <span>{filtered.length} icons</span>
        <span>Click an icon to insert it at the cursor.</span>
      </div>
    </div>
  )
}

export function IconsMenuTrigger({ editor, onInserted }: { editor: Editor; onInserted: (message: string) => void }) {
  return (
    <Popover
      width={430}
      trigger={({ toggle }) => (
        <button className="rb-big" type="button" onClick={toggle} title="Icons">
          <span className="rb-big-icon"><Sparkles size={22} /></span>
          <span className="rb-big-label">Icons</span>
          <span className="rb-caret" />
        </button>
      )}
    >
      {(close) => <IconsGallery editor={editor} onInserted={(message) => { onInserted(message); close() }} />}
    </Popover>
  )
}

export { iconSvg, svgDataUri }
