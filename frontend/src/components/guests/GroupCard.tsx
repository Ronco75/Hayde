import type { Group } from '../../types';
import { Pencil, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface GroupCardProps {
    group: Group;
    guestCount: number;
    onEdit: (group: Group) => void;
    onDelete: (groupId: number) => void;
}

function GroupCard({ group, guestCount, onEdit, onDelete }: GroupCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl flex justify-between items-start">
                    <span className="truncate" title={group.name}>{group.name}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">
                        {guestCount === 0 ? 'אין מוזמנים' : `${guestCount} מוזמנים`}
                    </span>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-0">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(group); }}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>עריכת שם הקבוצה</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); onDelete(group.id); }}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>מחיקת קבוצה</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </CardFooter>
        </Card>
    );
}

export default GroupCard;