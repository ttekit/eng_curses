import { useState, useEffect, forwardRef } from "react";
import { BookOpen, Loader2, CalendarIcon, Check } from "lucide-react";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { apiFetch, getResponseErrorMessage } from "../lib/api";
import { cn } from "../lib/utils";
import { AdminButton, AdminModal } from "./admin/adminUi";

const CustomDateTimeInput = forwardRef<HTMLInputElement, any>((props, ref) => {
  const { onClick, onFocus, value, onChange, onKeyDown, id } = props;

  return (
    <div className="relative w-full">
      <input
        id={id}
        type="datetime-local"
        ref={ref}
        value={value || ""}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        onFocus={(e) => e.stopPropagation()}
        autoComplete="off"
        className="w-full bg-[#161622] border border-[#2a2b36] hover:border-primary/50 rounded-xl pl-4 pr-12 py-3.5 text-[15px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0"
      />
      <button
        type="button"
        onClick={onClick}
        tabIndex={-1}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center"
      >
        <CalendarIcon className="size-5" />
      </button>
    </div>
  );
});
CustomDateTimeInput.displayName = "CustomDateTimeInput";

const ExplysDatePicker = ({ selected, onChange, id, onKeyDown }: any) => (
  <DatePicker
    selected={selected}
    onChange={onChange}
    showTimeSelect
    timeFormat="HH:mm"
    timeIntervals={15}
    dateFormat="yyyy-MM-dd'T'HH:mm"
    wrapperClassName="w-full"
    portalId="calendar-portal"
    preventOpenOnFocus={true}
    customInput={<CustomDateTimeInput id={id} onKeyDown={onKeyDown} />}
  />
);

export function AssignHomeworkButton({
  contentId,
  contentName,
}: {
  contentId: number;
  contentName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<
    Record<number, { availableFrom: string; deadline: string }>
  >({});

  useEffect(() => {
    if (isOpen && classes.length === 0) {
      setLoadingClasses(true);
      apiFetch("/teacher/classes", { method: "GET" })
        .then((res) => res.json())
        .then((data) => setClasses(Array.isArray(data) ? data : []))
        .catch(() => toast.error("Failed to load classes"))
        .finally(() => setLoadingClasses(false));
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (Object.keys(selectedClasses).length === 0) {
      return toast.error("Please select at least one class");
    }

    setIsSaving(true);
    try {
      const assignments = Object.entries(selectedClasses).map(
        ([cId, data]) => ({
          classId: Number(cId),
          availableFrom: data.availableFrom
            ? new Date(data.availableFrom).toISOString()
            : undefined,
          deadline: data.deadline
            ? new Date(data.deadline).toISOString()
            : undefined,
        }),
      );

      const res = await apiFetch(`/contents/teacher/assign/${contentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classAssignments: assignments }),
      });

      if (!res.ok) throw new Error(await getResponseErrorMessage(res));

      toast.success("Homework assigned successfully!");
      setIsOpen(false);
      setSelectedClasses({});
    } catch (e: any) {
      toast.error(e.message || "Failed to assign homework");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors border border-primary/20"
        title="Assign Homework"
      >
        <BookOpen className="size-3.5" />
        Assign Homework
      </button>

      <AdminModal
        open={isOpen}
        onClose={() => !isSaving && setIsOpen(false)}
        title="Assign as Homework"
        footer={
          <>
            <AdminButton
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </AdminButton>
            <AdminButton onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Assign"}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select the classes you want to assign the lesson{" "}
            <span className="font-bold text-foreground">"{contentName}"</span>{" "}
            to, and set the deadlines.
          </p>

          {loadingClasses ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="size-4 animate-spin" /> Loading classes...
            </div>
          ) : classes.length === 0 ? (
            <div className="bg-muted p-4 rounded-lg text-sm text-center border border-border/50">
              You don't have any classes yet. Create one in the "Students" tab.
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {classes.map((cls) => {
                const isSelected = !!selectedClasses[cls.id];
                const data = selectedClasses[cls.id] || {
                  availableFrom: "",
                  deadline: "",
                };
                return (
                  <div
                    key={cls.id}
                    className={cn(
                      "border border-border/70 rounded-xl p-4 space-y-4 transition-colors",
                      isSelected
                        ? "bg-primary/5 border-primary/40 shadow-sm"
                        : "bg-background hover:border-primary/30",
                    )}
                  >
                    <div
                      onClick={() => {
                        if (isSelected) {
                          const next = { ...selectedClasses };
                          delete next[cls.id];
                          setSelectedClasses(next);
                        } else {
                          setSelectedClasses((p) => ({
                            ...p,
                            [cls.id]: { availableFrom: "", deadline: "" },
                          }));
                        }
                      }}
                      className="flex items-center gap-3 font-semibold cursor-pointer text-sm select-none"
                    >
                      <div
                        className={cn(
                          "size-5 rounded flex items-center justify-center transition-colors shrink-0 border",
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/40 bg-background",
                        )}
                      >
                        {isSelected && (
                          <Check className="size-3.5 stroke-[3]" />
                        )}
                      </div>
                      <span className="text-foreground">{cls.name}</span>
                    </div>

                    {isSelected && (
                      <div className="flex flex-col gap-4 pl-8 pt-1">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">
                            Available from (optional)
                          </label>
                          <ExplysDatePicker
                            id={`assign-open-${cls.id}`}
                            selected={
                              data.availableFrom
                                ? new Date(data.availableFrom)
                                : null
                            }
                            onChange={(date: Date | null) =>
                              setSelectedClasses((p) => ({
                                ...p,
                                [cls.id]: {
                                  ...p[cls.id],
                                  availableFrom: date ? date.toISOString() : "",
                                },
                              }))
                            }
                            onKeyDown={(
                              e: React.KeyboardEvent<HTMLInputElement>,
                            ) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                document
                                  .getElementById(`assign-close-${cls.id}`)
                                  ?.focus();
                              }
                            }}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">
                            Deadline (optional)
                          </label>
                          <ExplysDatePicker
                            id={`assign-close-${cls.id}`}
                            selected={
                              data.deadline ? new Date(data.deadline) : null
                            }
                            onChange={(date: Date | null) =>
                              setSelectedClasses((p) => ({
                                ...p,
                                [cls.id]: {
                                  ...p[cls.id],
                                  deadline: date ? date.toISOString() : "",
                                },
                              }))
                            }
                            onKeyDown={(
                              e: React.KeyboardEvent<HTMLInputElement>,
                            ) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                void handleSave();
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AdminModal>
    </>
  );
}
