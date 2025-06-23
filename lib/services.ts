import { Event } from '../types/event';
import { supabase } from './supabase';

// Tipos para las estadísticas del usuario
export type UserStats = {
  eventsCount: number;
  followersCount: number;
  followingCount: number;
};

// Tipos para los badges del menú
export type MenuBadges = {
  myEvents: number;
  favorites: number;
};

// Servicios para eventos
export const eventServices = {
  // Obtener eventos del usuario actual
  async getUserEvents(): Promise<Event[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo eventos del usuario:', error);
      return [];
    }
  },

  // Obtener eventos favoritos del usuario
  async getFavoriteEvents(): Promise<Event[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Primero obtener los IDs de eventos favoritos
      const { data: favorites, error: favoritesError } = await supabase
        .from('favorites')
        .select('event_id')
        .eq('user_id', user.id);

      if (favoritesError) throw favoritesError;

      if (!favorites || favorites.length === 0) {
        return [];
      }

      const eventIds = favorites.map(fav => fav.event_id);

      // Obtener los eventos completos
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds)
        .order('date', { ascending: true });

      if (eventsError) throw eventsError;
      return events || [];
    } catch (error) {
      console.error('Error obteniendo eventos favoritos:', error);
      return [];
    }
  },

  // Obtener eventos próximos del usuario (solo eventos publicados)
  async getUpcomingEvents(): Promise<Event[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('creator_id', user.id)
        .eq('status', 'published')
        .gte('date', today)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo eventos próximos:', error);
      return [];
    }
  },

  // Obtener eventos pasados del usuario
  async getPastEvents(): Promise<Event[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('creator_id', user.id)
        .lt('date', today)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo eventos pasados:', error);
      return [];
    }
  },

  // Obtener eventos cancelados del usuario
  async getCancelledEvents(): Promise<Event[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('creator_id', user.id)
        .eq('status', 'cancelled')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo eventos cancelados:', error);
      return [];
    }
  },

  // Obtener eventos finalizados del usuario
  async getFinishedEvents(): Promise<Event[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('creator_id', user.id)
        .eq('status', 'finished')
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo eventos finalizados:', error);
      return [];
    }
  },

  // Cancelar un evento
  async cancelEvent(eventId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'cancelled' })
        .eq('id', eventId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error cancelando evento:', error);
      throw error;
    }
  },

  // Eliminar un evento
  async deleteEvent(eventId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error eliminando evento:', error);
      throw error;
    }
  }
};

// Servicios para estadísticas del usuario
export const userStatsServices = {
  // Obtener estadísticas del usuario
  async getUserStats(): Promise<UserStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener conteo de eventos publicados
      const { count: eventsCount, error: eventsError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id)
        .eq('status', 'published');

      if (eventsError) throw eventsError;

      // Por ahora, como no hay sistema de seguidores, retornamos 0
      const followersCount = 0;
      const followingCount = 0;

      return {
        eventsCount: eventsCount || 0,
        followersCount,
        followingCount
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del usuario:', error);
      return {
        eventsCount: 0,
        followersCount: 0,
        followingCount: 0
      };
    }
  }
};

// Servicios para badges del menú
export const menuBadgesServices = {
  // Obtener badges para el menú
  async getMenuBadges(): Promise<MenuBadges> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener conteo de eventos publicados del usuario
      const { count: myEvents, error: eventsError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', user.id)
        .eq('status', 'published');

      if (eventsError) throw eventsError;

      // Obtener conteo de favoritos
      const { count: favorites, error: favoritesError } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (favoritesError) throw favoritesError;

      return {
        myEvents: myEvents || 0,
        favorites: favorites || 0
      };
    } catch (error) {
      console.error('Error obteniendo badges del menú:', error);
      return {
        myEvents: 0,
        favorites: 0
      };
    }
  }
};

// Servicios para información del creador
export const creatorServices = {
  // Obtener información del creador de un evento
  async getEventCreator(creatorId: string): Promise<{ username: string; email: string } | null> {
    try {
      // Intentar obtener desde profiles primero
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, email')
        .eq('id', creatorId)
        .single();

      if (!profileError && profileData) {
        return {
          username: profileData.username || 'Usuario',
          email: profileData.email || ''
        };
      }

      // Si no existe profiles, intentar obtener desde auth.users
      // Como no tenemos acceso directo a auth.users, usamos una aproximación
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(creatorId);
      
      if (!userError && userData?.user) {
        const user = userData.user;
        return {
          username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
          email: user.email || ''
        };
      }

      // Información por defecto
      return {
        username: 'Usuario',
        email: 'usuario@evente-ar.com'
      };
    } catch (error) {
      console.error('Error obteniendo información del creador:', error);
      // Retornar información por defecto en caso de error
      return {
        username: 'Usuario',
        email: 'usuario@evente-ar.com'
      };
    }
  }
}; 