import * as L from "lucide-react";


function tint(Glyph: L.LucideIcon) {
    return function TintedIcon(props: L.LucideProps) {
        return <Glyph fill="currentColor" fillOpacity={0.22} {...props} />;
    };
}

export {
    Activity,
    ArrowDownRight,
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    AtSign,
    Braces,
    Check,
    ChevronDown,
    ChevronRight,
    ChevronsUpDown,
    ExternalLink,
    Hash,
    History,
    Link2,
    LoaderCircle,
    LogOut,
    Menu,
    Pipette,
    Plus,
    Power,
    RefreshCw,
    RotateCcw,
    Search,
    Wifi,
    WifiOff,
    X
} from "lucide-react";

export const BarChart3 = tint(L.BarChart3);
export const Bell = tint(L.Bell);
export const BellOff = tint(L.BellOff);
export const BellRing = tint(L.BellRing);
export const BookOpen = tint(L.BookOpen);
export const CalendarClock = tint(L.CalendarClock);
export const CircleAlert = tint(L.CircleAlert);
export const CircleCheck = tint(L.CircleCheck);
export const CircleSlash = tint(L.CircleSlash);
export const CircleX = tint(L.CircleX);
export const Clock = tint(L.Clock);
export const Crown = tint(L.Crown);
export const Eye = tint(L.Eye);
export const Film = tint(L.Film);
export const FlaskConical = tint(L.FlaskConical);
export const FolderClosed = tint(L.FolderClosed);
export const Gauge = tint(L.Gauge);
export const ImageOff = tint(L.ImageOff);
export const ImagePlus = tint(L.ImagePlus);
export const Info = tint(L.Info);
export const LifeBuoy = tint(L.LifeBuoy);
export const LayoutGrid = tint(L.LayoutGrid);
export const LayoutPanelTop = tint(L.LayoutPanelTop);
export const Lock = tint(L.Lock);
export const Megaphone = tint(L.Megaphone);
export const MessageSquare = tint(L.MessageSquare);
export const MessageSquareText = tint(L.MessageSquareText);
export const MousePointerClick = tint(L.MousePointerClick);
export const PanelTop = tint(L.PanelTop);
export const Pencil = tint(L.Pencil);
export const Radio = tint(L.Radio);
export const RadioTower = tint(L.RadioTower);
export const Receipt = tint(L.Receipt);
export const Rocket = tint(L.Rocket);
export const Save = tint(L.Save);
export const Server = tint(L.Server);
export const Settings = tint(L.Settings);
export const Settings2 = tint(L.Settings2);
export const ShieldAlert = tint(L.ShieldAlert);
export const Smartphone = tint(L.Smartphone);
export const Trash = tint(L.Trash);
export const Trash2 = tint(L.Trash2);
export const TriangleAlert = tint(L.TriangleAlert);
export const UserRound = tint(L.UserRound);
export const Users = tint(L.Users);
export const Video = tint(L.Video);
export const Volume2 = tint(L.Volume2);
export const Wand = tint(L.Wand);
export const Wrench = tint(L.Wrench);
