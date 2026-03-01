import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Image } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchAllUsersThunk } from '../../store/slices/authSlice';
import Card from '../../components/common/Card';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  adminBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  statDivider: {
    width: 1,
    height: 36,
    alignSelf: 'center',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
});

const AdminUsersScreen = () => {
  const { colors, typography } = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { users, isLoading } = useAppSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchAllUsersThunk());
  }, [dispatch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('AdminUserAttendanceDetails', { userId: item._id, userName: item.name })}
      activeOpacity={0.7}
    >
      <Card style={styles.userCard}>
        <View style={styles.cardContent}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.accent + '15' }]}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
              <Text style={[typography.h3, { color: colors.accent }]}>
                {item.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            )}
          </View>
        
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={[typography.h4, { color: colors.textPrimary }]}>{item.name}</Text>
            {item.role === 'admin' && (
              <View style={[styles.adminBadge, { backgroundColor: colors.accent + '20' }]}>
                <Text style={[typography.labelSmall, { color: colors.accent }]}>ADMIN</Text>
              </View>
            )}
          </View>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{item.email}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="calendar-range" size={14} color={colors.textTertiary} />
              <Text style={[typography.labelSmall, { color: colors.textTertiary, marginLeft: 4 }]}>
                Joined {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </View>
      
      <View style={[styles.statsRow, { borderTopColor: colors.border, backgroundColor: colors.surfaceElevated }]}>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="medical-bag" size={14} color={colors.textTertiary} style={{ marginRight: 6 }} />
          <View>
            <Text style={[typography.labelSmall, { color: colors.textTertiary }]}>MEDICAL</Text>
            <Text style={[typography.h4, { color: colors.textPrimary }]}>{item.medicalLeaves ?? 0} days</Text>
          </View>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <MaterialCommunityIcons name="palm-tree" size={14} color={colors.textTertiary} style={{ marginRight: 6 }} />
          <View>
            <Text style={[typography.labelSmall, { color: colors.textTertiary }]}>CASUAL</Text>
            <Text style={[typography.h4, { color: colors.textPrimary }]}>{item.casualLeaves ?? 0} days</Text>
          </View>
        </View>
      </View>
    </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[typography.h1, { color: colors.textPrimary }]}>Users</Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          Manage all registered employees ({users.length})
        </Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={() => dispatch(fetchAllUsersThunk())} 
            tintColor={colors.accent} 
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color={colors.textTertiary} />
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: 16 }]}>
              No users found
            </Text>
          </View>
        }
      />
    </View>
  );
};


export default AdminUsersScreen;
