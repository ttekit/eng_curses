import { useState, useEffect, forwardRef } from "react";
// Добавили Users в импорты!
import { BookOpen, Loader2, CalendarIcon, Check, Users } from "lucide-react";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { apiFetch, getResponseErrorMessage } from "../lib/api";
import { cn } from "../lib/utils";
import { AdminButton, AdminModal } from "./admin/adminUi";
import { useAppMessages } from "../hooks/useAppMessages";
import { getErrorMessage } from "../lib/error-message";
import type {
  DatePickerInputProps,
  DatePickerWrapperProps,
} from "../types/date-picker-input";
import { useUser } from "../context/UserContext";

const CustomDateTimeInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  (props, ref) => {
    const { onClick, value, onChange, onKeyDown, id } = props;

    return (
      <div className="relative w-full">
        <input
          id={id}
          type="datetime-local"
          max="9999-12-31T23:59"
          ref={ref}
          value={value || ""}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={(e) => e.stopPropagation()}
          autoComplete="off"
          className="flex h-12 w-full bg-background border border-input hover:border-primary/50 rounded-xl pl-4 pr-16 py-2 text-[15px] font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 ring-offset-background transition-all shadow-sm [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-clear-button]:hidden [&::-webkit-inner-spin-button]:hidden"
        />
        <button
          type="button"
          onClick={onClick}
          tabIndex={-1}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
        >
          <CalendarIcon className="size-5" />
        </button>
      </div>
    );
  },
);
CustomDateTimeInput.displayName = "CustomDateTimeInput";

const ExplysDatePicker = ({
  selected,
  onChange,
  id,
  onKeyDown,
}: DatePickerWrapperProps) => (
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
  const { user } = useUser();

  // ВСЕ ХУКИ ДОЛЖНЫ БЫТЬ ОБЪЯВЛЕНЫ ДО RETURN!
  const [isOpen, setIsOpen] = useState(false);
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<
    Record<number, { availableFrom: string; deadline: string }>
  >({});

  const L = useAppMessages().lesson;

  useEffect(() => {
    if (isOpen && classes.length === 0) {
      setLoadingClasses(true);
      apiFetch("/teacher/classes", { method: "GET" })
        .then((res) => res.json())
        .then((data) => setClasses(Array.isArray(data) ? data : []))
        .catch(() => toast.error("Failed to load classes"))
        .finally(() => setLoadingClasses(false));
    }
  }, [isOpen, classes.length]);

  // ПЕРЕНЕСЛИ ПРОВЕРКУ СЮДА (после всех хуков)
  if (user?.role?.toLowerCase() !== "teacher") {
    return null;
  }

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
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, "Failed to assign homework"));
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCount = Object.keys(selectedClasses).length;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg hover:cursor-pointer bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors border border-primary/20"
        title="Assign Homework"
      >
        <BookOpen className="size-3.5" />
        {L.assignHomework}
      </button>

      <AdminModal
        open={isOpen}
        onClose={() => !isSaving && setIsOpen(false)}
        title="Assign as Homework"
        footer={
          <div className="flex items-center justify-between w-full">
            <label className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none">
              <input
                type="checkbox"
                defaultChecked
                className="size-4 rounded border-border bg-background accent-purple-600"
              />
              Notify learners by email
            </label>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <AdminButton
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </AdminButton>
              <AdminButton onClick={handleSave} disabled={isSaving}>
                {isSaving
                  ? "Saving..."
                  : selectedCount > 0
                    ? `Assign to ${selectedCount}`
                    : "Assign"}
              </AdminButton>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="space-y-1 text-sm text-muted-foreground">
            Applies to{" "}
            <span className="font-semibold text-purple-400">
              {selectedCount}
            </span>{" "}
            classes · "{contentName}"
          </div>

          {loadingClasses ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="size-4 animate-spin" /> Loading classes...
            </div>
          ) : classes.length === 0 ? (
            <div className="bg-muted p-4 rounded-lg text-sm text-center border border-border/50">
              You don't have any classes yet. Create one in the "Students" tab.
            </div>
          ) : (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 pb-2">
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
                      "flex flex-col border rounded-[20px] transition-all overflow-hidden",
                      isSelected
                        ? "bg-purple-500/10 border-purple-500 shadow-[0_0_0_1px_rgba(168,85,247,0.2)]"
                        : "bg-background border-border/60 hover:border-border",
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
                      className="flex items-center justify-between p-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-11 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                          <Users className="size-5" />
                        </div>

                        <div>
                          <h4 className="text-[15px] font-semibold text-foreground leading-tight">
                            {cls.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[13px] text-muted-foreground mt-1">
                            Cohort Group
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 ml-4">
                        {isSelected ? (
                          <div className="size-6 rounded-full bg-purple-600 flex items-center justify-center shadow-sm">
                            <Check className="size-3.5 text-white stroke-[3]" />
                          </div>
                        ) : (
                          <div className="size-6 rounded-full border-[2px] border-border/80" />
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="px-5 pb-5 pt-3 border-t border-purple-500/20 bg-background/50">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="space-y-1.5 flex-1">
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
                                    availableFrom: date
                                      ? date.toISOString()
                                      : "",
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

                          <div className="space-y-1.5 flex-1">
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
