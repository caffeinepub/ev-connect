import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BatteryAlert,
  CarProfile,
  CarStatus,
  Message,
  RegisterCarInput,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Car Profile ─────────────────────────────────────────────────────────────

export function useOwnCarProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<CarProfile | null>({
    queryKey: ["ownCarProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getOwnCarProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
  });
}

export function useAllActiveCars() {
  const { actor, isFetching } = useActor();
  return useQuery<CarProfile[]>({
    queryKey: ["allActiveCars"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActiveCars();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}

export function useAlertFeed() {
  const { actor, isFetching } = useActor();
  return useQuery<BatteryAlert[]>({
    queryKey: ["alertFeed"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAlertFeed();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 20_000,
    staleTime: 15_000,
  });
}

export function useMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMessages();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useRegisterCar() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegisterCarInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerCar(input);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["ownCarProfile"] });
    },
  });
}

export function useUpdateBatteryLevel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (level: number) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateBatteryLevel(BigInt(level));
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["ownCarProfile"] });
      void qc.invalidateQueries({ queryKey: ["allActiveCars"] });
    },
  });
}

export function useUpdateStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (status: CarStatus) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateStatus(status);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["ownCarProfile"] });
      void qc.invalidateQueries({ queryKey: ["allActiveCars"] });
    },
  });
}

export function useDeleteCarProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteCarProfile();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["ownCarProfile"] });
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      to,
      content,
    }: {
      to: Principal | null;
      content: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendMessage(to, content);
    },
  });
}

export function useMarkMessagesAsRead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.markMessagesAsRead();
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}
